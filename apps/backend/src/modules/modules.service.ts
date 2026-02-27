import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { existsSync, unlinkSync } from 'fs';

import { ActivityService } from '../activity/activity.service';

// Whitelisted columns for dynamic UPDATE
const ALLOWED_UPDATE_COLS = new Set(['type', 'content', 'file_path', 'url', 'title', 'metadata', 'order']);

@Injectable()
export class ModulesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly activity: ActivityService
  ) { }

  async create(userId: string, ip: string, dto: CreateModuleDto) {
    const mod = await this.db.queryOne(
      `INSERT INTO modules (page_id, type, content, file_path, url, title, metadata, "order")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [(dto as any).page_id, dto.type, (dto as any).content || null, (dto as any).file_path || null,
      (dto as any).url || null, (dto as any).title || null,
      (dto as any).metadata ? JSON.stringify((dto as any).metadata) : null,
      (dto as any).order || 0],
    );
    if (mod) this.activity.log(userId, 'created', 'module', mod.id, `Reordered module [type: ${mod.type}]`, ip).catch(() => { });
    return mod;
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

  async update(userId: string, ip: string, id: string, dto: UpdateModuleDto) {
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

    const updated = await this.db.queryOne(
      `UPDATE modules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (updated) this.activity.log(userId, 'updated', 'module', id, `Updated module settings`, ip).catch(() => { });
    return updated;
  }

  async remove(userId: string, ip: string, id: string) {
    const mod = await this.findOne(id);
    // Cleanup file from disk
    if (mod.file_path) {
      try { if (existsSync(mod.file_path)) unlinkSync(mod.file_path); } catch { }
    }
    const removed = await this.db.queryOne(
      `UPDATE modules SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    if (removed) this.activity.log(userId, 'deleted', 'module', id, `Soft deleted module`, ip).catch(() => { });
    return removed;
  }

  async reorder(userId: string, ip: string, pageId: string, orderedIds: string[]) {
    await this.db.transaction(async (client) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(`UPDATE modules SET "order" = $1 WHERE id = $2 AND page_id = $3`, [i, orderedIds[i], pageId]);
      }
    });
    this.activity.log(userId, 'updated', 'page', pageId, `Reordered modules on page`, ip).catch(() => { });
    return { reordered: true };
  }
}
