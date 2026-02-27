import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivityService } from '../activity/activity.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { existsSync, unlinkSync } from 'fs';

const ALLOWED_UPDATE_COLS = new Set(['title', 'slug', 'status', 'icon', 'show_author', 'show_metrics', 'template_id', 'section_id']);

@Injectable()
export class PagesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly activity: ActivityService,
  ) { }

  // ── Auto slug generation ────────────────────────────
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = slug;
    let counter = 1;
    while (true) {
      const existing = await this.db.queryOne(
        excludeId
          ? `SELECT id FROM pages WHERE slug = $1 AND id != $2`
          : `SELECT id FROM pages WHERE slug = $1`,
        excludeId ? [candidate, excludeId] : [candidate],
      );
      if (!existing) return candidate;
      candidate = `${slug}-${counter++}`;
    }
  }

  async create(dto: CreatePageDto, ip?: string) {
    // Auto-generate slug if not provided
    const slug = (dto as any).slug || this.generateSlug(dto.title);
    const uniqueSlug = await this.ensureUniqueSlug(slug);

    try {
      const page = await this.db.queryOne(
        `INSERT INTO pages (section_id, title, slug, status, show_author, show_metrics, icon, created_by_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [dto.section_id, dto.title, uniqueSlug, (dto as any).status || 'draft',
        (dto as any).show_author !== false, (dto as any).show_metrics !== false,
        (dto as any).icon || null, (dto as any).created_by_id || null],
      );
      if (page) {
        page.section = await this.db.queryOne(`SELECT * FROM sections WHERE id = $1`, [page.section_id]);
        if ((dto as any).created_by_id) {
          this.activity.log((dto as any).created_by_id, 'created', 'page', page.id, `Created page "${dto.title}"`, ip).catch(() => { });
        }
      }
      return page;
    } catch (err: any) {
      if (err.code === '23505') throw new ConflictException(`Page with slug "${uniqueSlug}" already exists`);
      throw err;
    }
  }

  async findAll(sectionId?: string, limit = 50, offset = 0) {
    if (sectionId) {
      return this.db.query(
        `SELECT p.*, row_to_json(s.*) AS section FROM pages p
         LEFT JOIN sections s ON s.id = p.section_id
         WHERE p.section_id = $1 AND p.deleted_at IS NULL ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [sectionId, limit, offset],
      );
    }
    return this.db.query(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
       LEFT JOIN sections s ON s.id = p.section_id
       WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async findOne(id: string) {
    const page = await this.db.queryOne(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
       LEFT JOIN sections s ON s.id = p.section_id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id],
    );
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    page.modules = await this.db.query(
      `SELECT * FROM modules WHERE page_id = $1 AND deleted_at IS NULL ORDER BY "order" ASC`,
      [id],
    );
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.db.queryOne(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
       LEFT JOIN sections s ON s.id = p.section_id
       WHERE p.slug = $1 AND p.deleted_at IS NULL AND p.status = 'published'`,
      [slug],
    );
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    page.modules = await this.db.query(
      `SELECT * FROM modules WHERE page_id = $1 AND deleted_at IS NULL ORDER BY "order" ASC`,
      [page.id],
    );
    // Track view count
    this.db.execute(
      `UPDATE pages SET views = COALESCE(views, 0) + 1 WHERE id = $1`, [page.id],
    ).catch(() => { });
    return page;
  }

  async update(id: string, dto: UpdatePageDto, userId?: string, ip?: string) {
    await this.findOne(id);
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && ALLOWED_UPDATE_COLS.has(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (fields.length === 0) return this.findOne(id);
    fields.push(`updated_at = NOW()`);
    if (userId) { fields.push(`updated_by_id = $${idx}`); values.push(userId); idx++; }
    values.push(id);

    try {
      const page = await this.db.queryOne(
        `UPDATE pages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values,
      );
      if (userId && page) {
        this.activity.log(userId, 'updated', 'page', id, `Updated page "${page.title}"`, ip).catch(() => { });
      }
      return page;
    } catch (err: any) {
      if (err.code === '23505') throw new ConflictException('A page with this slug already exists');
      throw err;
    }
  }

  async remove(id: string, userId?: string, ip?: string) {
    const page = await this.findOne(id);
    const result = await this.db.queryOne(`UPDATE pages SET deleted_at = NOW() WHERE id = $1 RETURNING *`, [id]);
    if (userId) {
      this.activity.log(userId, 'deleted', 'page', id, `Moved page "${page.title}" to trash`, ip).catch(() => { });
    }
    return result;
  }

  async publish(id: string, userId?: string, ip?: string) {
    const page = await this.findOne(id);
    const result = await this.db.queryOne(
      `UPDATE pages SET status = 'published', updated_by_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, userId || null],
    );
    if (userId) {
      this.activity.log(userId, 'published', 'page', id, `Published page "${page.title}"`, ip).catch(() => { });
    }
    return result;
  }

  async archive(id: string, userId?: string, ip?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'archived', updated_by_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, userId || null],
    );
  }

  async submitForReview(id: string) {
    await this.findOne(id);
    return this.db.queryOne(`UPDATE pages SET status = 'review', updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
  }

  async approve(id: string, reviewerId?: string, ip?: string) {
    const page = await this.findOne(id);
    const result = await this.db.queryOne(
      `UPDATE pages SET status = 'published', reviewed_by_id = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, reviewerId || null],
    );
    if (reviewerId) {
      this.activity.log(reviewerId, 'approved', 'page', id, `Approved page "${page.title}"`, ip).catch(() => { });
    }
    return result;
  }

  async reject(id: string, reviewerId?: string, ip?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'draft', reviewed_by_id = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, reviewerId || null],
    );
  }

  // ── Duplicate Page ──────────────────────────────────
  async duplicate(id: string, userId?: string, ip?: string) {
    const page = await this.findOne(id);
    const newSlug = await this.ensureUniqueSlug(page.slug + '-copy');
    const newPage = await this.db.queryOne(
      `INSERT INTO pages (section_id, title, slug, status, show_author, show_metrics, icon, created_by_id)
       VALUES ($1, $2, $3, 'draft', $4, $5, $6, $7) RETURNING *`,
      [page.section_id, `${page.title} (Copy)`, newSlug,
      page.show_author, page.show_metrics, page.icon, userId || null],
    );
    // Copy modules
    if (newPage && page.modules) {
      for (const mod of page.modules) {
        await this.db.execute(
          `INSERT INTO modules (page_id, type, content, file_path, url, title, metadata, "order")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [newPage.id, mod.type, mod.content, mod.file_path, mod.url, mod.title,
          mod.metadata ? JSON.stringify(mod.metadata) : null, mod.order],
        );
      }
    }
    if (userId && newPage) {
      this.activity.log(userId, 'duplicated', 'page', newPage.id, `Duplicated page "${page.title}"`, ip).catch(() => { });
    }
    return this.findOne(newPage!.id);
  }

  // ── Trash Management ────────────────────────────────
  async findTrashed() {
    return this.db.query(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
       LEFT JOIN sections s ON s.id = p.section_id
       WHERE p.deleted_at IS NOT NULL ORDER BY p.deleted_at DESC`,
    );
  }

  async restore(id: string, userId?: string, ip?: string) {
    const result = await this.db.queryOne(`UPDATE pages SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
    if (userId && result) {
      this.activity.log(userId, 'restored', 'page', id, `Restored page "${result.title}" from trash`, ip).catch(() => { });
    }
    return result;
  }

  async permanentDelete(id: string) {
    const modules = await this.db.query(`SELECT file_path FROM modules WHERE page_id = $1`, [id]);
    for (const mod of modules) {
      if (mod.file_path) { try { if (existsSync(mod.file_path)) unlinkSync(mod.file_path); } catch { } }
    }
    await this.db.execute(`DELETE FROM modules WHERE page_id = $1`, [id]);
    await this.db.execute(`DELETE FROM pages WHERE id = $1`, [id]);
    return { deleted: true };
  }
}
