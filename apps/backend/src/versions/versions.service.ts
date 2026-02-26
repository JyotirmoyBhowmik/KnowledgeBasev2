import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class VersionsService {
    constructor(private readonly db: DatabaseService) { }

    async snapshot(pageId: string, userId?: string) {
        const page = await this.db.queryOne(`SELECT * FROM pages WHERE id = $1`, [pageId]);
        if (!page) return null;

        const modules = await this.db.query(
            `SELECT * FROM modules WHERE page_id = $1 AND deleted_at IS NULL ORDER BY "order" ASC`,
            [pageId],
        );

        const lastVersion = await this.db.queryOne(
            `SELECT version FROM page_versions WHERE page_id = $1 ORDER BY version DESC LIMIT 1`,
            [pageId],
        );

        const snapshot = { ...page, modules };

        return this.db.queryOne(
            `INSERT INTO page_versions (page_id, version, snapshot, changed_by) VALUES ($1, $2, $3, $4) RETURNING *`,
            [pageId, (lastVersion?.version || 0) + 1, JSON.stringify(snapshot), userId || null],
        );
    }

    async findAll(pageId: string) {
        return this.db.query(
            `SELECT pv.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS user
             FROM page_versions pv
             LEFT JOIN users u ON u.id = pv.changed_by
             WHERE pv.page_id = $1
             ORDER BY pv.version DESC`,
            [pageId],
        );
    }

    async restore(pageId: string, versionId: string) {
        const ver = await this.db.queryOne(`SELECT * FROM page_versions WHERE id = $1`, [versionId]);
        if (!ver) return null;

        const snap = ver.snapshot as any;

        // Restore page fields
        await this.db.execute(
            `UPDATE pages SET title = $1, status = $2, icon = $3, updated_at = NOW() WHERE id = $4`,
            [snap.title, snap.status, snap.icon || null, pageId],
        );

        // Soft-delete current modules
        await this.db.execute(
            `UPDATE modules SET deleted_at = NOW() WHERE page_id = $1 AND deleted_at IS NULL`,
            [pageId],
        );

        // Re-create modules from snapshot
        if (snap.modules?.length) {
            for (const mod of snap.modules) {
                await this.db.execute(
                    `INSERT INTO modules (page_id, type, content, file_path, url, title, metadata, "order")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [pageId, mod.type, mod.content || null, mod.file_path || null,
                        mod.url || null, mod.title || null,
                        mod.metadata ? JSON.stringify(mod.metadata) : null, mod.order || 0],
                );
            }
        }
        return { restored: true, version: ver.version };
    }
}
