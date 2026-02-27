import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { ActivityService } from '../activity/activity.service';

@Injectable()
export class SectionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly activity: ActivityService
  ) { }

  async create(userId: string, ip: string, dto: CreateSectionDto) {
    try {
      const section = await this.db.queryOne(
        `INSERT INTO sections (name, slug, route, roles_allowed, "order", icon, visible, parent_id, show_on_homepage, homepage_order)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [dto.name, dto.slug, (dto as any).route || null, (dto as any).roles_allowed ? JSON.stringify((dto as any).roles_allowed) : null,
        (dto as any).order || 0, (dto as any).icon || null, (dto as any).visible !== false, (dto as any).parent_id || null, (dto as any).show_on_homepage !== false, (dto as any).homepage_order || 0],
      );
      if (section) this.activity.log(userId, 'created', 'section', section.id, `Created section "${dto.name}"`, ip).catch(() => { });
      return section;
    } catch (err: any) {
      require('fs').writeFileSync('/tmp/backend_error.log', err.stack || err.toString());
      if (err.code === '23505') throw new ConflictException(`Section with slug "${dto.slug}" or name "${dto.name}" already exists`);
      throw err;
    }
  }

  async findAll() {
    const sections = await this.db.query(
      `SELECT s.*, COALESCE(json_agg(
                json_build_object('id', p.id, 'title', p.title, 'slug', p.slug, 'status', p.status, 'created_at', p.created_at)
                ORDER BY p.created_at DESC
             ) FILTER (WHERE p.id IS NOT NULL AND p.deleted_at IS NULL), '[]') AS pages
             FROM sections s
             LEFT JOIN pages p ON p.section_id = s.id AND p.deleted_at IS NULL
             GROUP BY s.id
             ORDER BY s."order" ASC`,
    );
    return sections;
  }

  async findOne(id: string) {
    const section = await this.db.queryOne(
      `SELECT s.*, COALESCE(json_agg(
                json_build_object('id', p.id, 'title', p.title, 'slug', p.slug, 'status', p.status, 'created_at', p.created_at)
                ORDER BY p.created_at DESC
             ) FILTER (WHERE p.id IS NOT NULL AND p.deleted_at IS NULL), '[]') AS pages
             FROM sections s
             LEFT JOIN pages p ON p.section_id = s.id AND p.deleted_at IS NULL
             WHERE s.id = $1
             GROUP BY s.id`,
      [id],
    );
    if (!section) throw new NotFoundException(`Section ${id} not found`);
    return section;
  }

  async getTree(userRoles: string[] = []) {
    const allSections = await this.db.query(
      `SELECT * FROM sections WHERE visible = TRUE ORDER BY "order" ASC`,
    );

    const filterByRoles = (section: any) => {
      if (!section.roles_allowed || (Array.isArray(section.roles_allowed) && section.roles_allowed.length === 0)) return true;
      const allowedRoles: string[] = section.roles_allowed;
      return allowedRoles.some(r => userRoles.includes(r));
    };

    const buildTree = (parentId: string | null = null): any[] => {
      return allSections
        .filter(s => s.parent_id === parentId && filterByRoles(s))
        .map(s => ({ ...s, children: buildTree(s.id) }));
    };

    return buildTree();
  }

  async findBySlug(slug: string) {
    const section = await this.db.queryOne(
      `SELECT s.*, COALESCE(json_agg(
                json_build_object('id', p.id, 'title', p.title, 'slug', p.slug, 'status', p.status, 'created_at', p.created_at)
                ORDER BY p.created_at DESC
             ) FILTER (WHERE p.id IS NOT NULL AND p.deleted_at IS NULL AND p.status = 'published'), '[]') AS pages
             FROM sections s
             LEFT JOIN pages p ON p.section_id = s.id AND p.deleted_at IS NULL AND p.status = 'published'
             WHERE s.slug = $1
             GROUP BY s.id`,
      [slug],
    );
    if (!section) throw new NotFoundException(`Section "${slug}" not found`);
    return section;
  }

  async update(userId: string, ip: string, id: string, dto: UpdateSectionDto) {
    await this.findOne(id);
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const ALLOWED_COLS = new Set(['name', 'slug', 'route', 'roles_allowed', 'order', 'icon', 'visible', 'parent_id', 'show_on_homepage', 'homepage_order']);
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && ALLOWED_COLS.has(key)) {
        const col = key === 'order' ? `"order"` : key;
        fields.push(`${col} = $${idx}`);
        values.push(key === 'roles_allowed' ? JSON.stringify(value) : value);
        idx++;
      }
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    try {
      const updated = await this.db.queryOne(
        `UPDATE sections SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values,
      );
      if (updated) this.activity.log(userId, 'updated', 'section', id, `Updated section settings for "${dto.name || 'section'}"`, ip).catch(() => { });
      return updated;
    } catch (err: any) {
      require('fs').writeFileSync('/tmp/backend_error.log', err.stack || err.toString());
      if (err.code === '23505') throw new ConflictException(`Unique constraint violation (duplicate slug/name)`);
      throw err;
    }
  }

  async remove(userId: string, ip: string, id: string) {
    const section = await this.findOne(id);
    await this.db.execute(`DELETE FROM sections WHERE id = $1`, [id]);
    this.activity.log(userId, 'deleted', 'section', id, `Deleted section "${section.name}"`, ip).catch(() => { });
    return { deleted: true };
  }

  async reorder(userId: string, ip: string, orderedIds: string[]) {
    await this.db.transaction(async (client) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(`UPDATE sections SET "order" = $1 WHERE id = $2`, [i, orderedIds[i]]);
      }
    });
    this.activity.log(userId, 'updated', 'sections', 'all', `Reordered knowledge base sections`, ip).catch(() => { });
    return { reordered: true };
  }
}
