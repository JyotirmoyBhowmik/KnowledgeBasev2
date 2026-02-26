import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { existsSync, unlinkSync } from 'fs';

// Whitelisted columns for dynamic UPDATE
const ALLOWED_UPDATE_COLS = new Set(['type', 'content', 'file_path', 'url', 'title', 'metadata', 'order']);

@Injectable()
export class ModulesService {
  constructor(private readonly db: DatabaseService) { }

  async create(dto: CreateModuleDto) {
    return this.db.queryOne(
      `INSERT INTO modules (page_id, type, content, file_path, url, title, metadata, "order")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [(dto as any).page_id, dto.type, (dto as any).content || null, (dto as any).file_path || null,
      (dto as any).url || null, (dto as any).title || null,
      (dto as any).metadata ? JSON.stringify((dto as any).metadata) : null,
      (dto as any).order || 0],
    );
  }

  async findAllByPage(pageId: string) {
    return this.db.query(
      `SELECT * FROM modules WHERE page_id = $1 AND deleted_at IS NULL ORDER BY "order" ASC`,
      [pageId],
    );
  }

  async findOne(id: string) {
    const mod = await this.db.queryOne(
      `SELECT * FROM modules WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!mod) throw new NotFoundException(`Module ${id} not found`);
    return mod;
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(dto)) {
      // Only allow whitelisted columns — prevents SQL injection via key names
      if (value !== undefined && key !== 'page_id' && ALLOWED_UPDATE_COLS.has(key)) {
        const col = key === 'order' ? `"order"` : key;
        fields.push(`${col} = $${idx}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
        idx++;
      }
    }

    if (fields.length === 0) return this.findOne(id);
    fields.push(`updated_at = NOW()`);
    values.push(id);

    return this.db.queryOne(
      `UPDATE modules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
  }

  async remove(id: string) {
    const mod = await this.findOne(id);
    // Cleanup file from disk
    if (mod.file_path) {
      try { if (existsSync(mod.file_path)) unlinkSync(mod.file_path); } catch { }
    }
    return this.db.queryOne(
      `UPDATE modules SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
  }

  async reorder(pageId: string, orderedIds: string[]) {
    await this.db.transaction(async (client) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(`UPDATE modules SET "order" = $1 WHERE id = $2 AND page_id = $3`, [i, orderedIds[i], pageId]);
      }
    });
    return { reordered: true };
  }
}
