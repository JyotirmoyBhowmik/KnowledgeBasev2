import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly db: DatabaseService) { }

  async create(dto: CreatePageDto) {
    const page = await this.db.queryOne(
      `INSERT INTO pages (section_id, title, slug, status, show_author, show_metrics, icon, created_by_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [dto.section_id, dto.title, dto.slug, (dto as any).status || 'draft',
      (dto as any).show_author !== false, (dto as any).show_metrics !== false,
      (dto as any).icon || null, (dto as any).created_by_id || null],
    );
    if (page) {
      page.section = await this.db.queryOne(`SELECT * FROM sections WHERE id = $1`, [page.section_id]);
    }
    return page;
  }

  async findAll(sectionId?: string) {
    if (sectionId) {
      return this.db.query(
        `SELECT p.*, row_to_json(s.*) AS section FROM pages p
                 LEFT JOIN sections s ON s.id = p.section_id
                 WHERE p.section_id = $1 AND p.deleted_at IS NULL ORDER BY p.created_at DESC`,
        [sectionId],
      );
    }
    return this.db.query(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
             LEFT JOIN sections s ON s.id = p.section_id
             WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC`,
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
             WHERE p.slug = $1 AND p.deleted_at IS NULL`,
      [slug],
    );
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);

    page.modules = await this.db.query(
      `SELECT * FROM modules WHERE page_id = $1 AND deleted_at IS NULL ORDER BY "order" ASC`,
      [page.id],
    );
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    return this.db.queryOne(
      `UPDATE pages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET deleted_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
  }

  async publish(id: string, userId?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'published', updated_by_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, userId || null],
    );
  }

  async archive(id: string, userId?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'archived', updated_by_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, userId || null],
    );
  }

  // ── Approval Workflow ─────────────────────────────────

  async submitForReview(id: string) {
    await this.findOne(id);
    return this.db.queryOne(`UPDATE pages SET status = 'review', updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
  }

  async approve(id: string, reviewerId?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'published', reviewed_by_id = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, reviewerId || null],
    );
  }

  async reject(id: string, reviewerId?: string) {
    await this.findOne(id);
    return this.db.queryOne(
      `UPDATE pages SET status = 'draft', reviewed_by_id = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, reviewerId || null],
    );
  }

  // ── Trash Management ──────────────────────────────────

  async findTrashed() {
    return this.db.query(
      `SELECT p.*, row_to_json(s.*) AS section FROM pages p
             LEFT JOIN sections s ON s.id = p.section_id
             WHERE p.deleted_at IS NOT NULL ORDER BY p.deleted_at DESC`,
    );
  }

  async restore(id: string) {
    return this.db.queryOne(`UPDATE pages SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);
  }

  async permanentDelete(id: string) {
    await this.db.execute(`DELETE FROM pages WHERE id = $1`, [id]);
    return { deleted: true };
  }
}
