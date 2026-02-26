import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) { }

  @Get()
  getHello() {
    return { message: 'Knowledge Base API', version: '2.0.0' };
  }

  @Get('api/health')
  async health() {
    try {
      await this.db.queryOne('SELECT 1 AS ok');
      return { status: 'ok', timestamp: new Date().toISOString(), database: 'connected' };
    } catch {
      return { status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' };
    }
  }

  // Public endpoint — only published pages
  @Get('api/public/pages')
  async getPublishedPages() {
    return this.db.query(
      `SELECT p.id, p.title, p.slug, p.icon, p.status, p.created_at, p.updated_at,
                    row_to_json(s.*) AS section
             FROM pages p
             LEFT JOIN sections s ON s.id = p.section_id
             WHERE p.status = 'published' AND p.deleted_at IS NULL
             ORDER BY p.updated_at DESC
             LIMIT 50`,
    );
  }

  @Get('api/public/pages/recent')
  async getRecentPublished() {
    return this.db.query(
      `SELECT p.id, p.title, p.slug, p.icon, p.status, p.created_at, p.updated_at,
                    row_to_json(s.*) AS section
             FROM pages p
             LEFT JOIN sections s ON s.id = p.section_id
             WHERE p.status = 'published' AND p.deleted_at IS NULL
             ORDER BY p.created_at DESC
             LIMIT 10`,
    );
  }

  // Full-text search
  @Get('api/public/search')
  async search(@Query('q') q: string) {
    if (!q || q.trim().length < 2) return [];
    const term = `%${q.trim()}%`;
    return this.db.query(
      `SELECT p.id, p.title, p.slug, p.icon, p.status, p.created_at,
                    row_to_json(s.*) AS section
             FROM pages p
             LEFT JOIN sections s ON s.id = p.section_id
             WHERE p.status = 'published' AND p.deleted_at IS NULL
               AND (p.title ILIKE $1 OR EXISTS (
                    SELECT 1 FROM modules m WHERE m.page_id = p.id AND m.deleted_at IS NULL
                    AND (m.content ILIKE $1 OR m.title ILIKE $1)
               ))
             ORDER BY p.updated_at DESC
             LIMIT 20`,
      [term],
    );
  }
}
