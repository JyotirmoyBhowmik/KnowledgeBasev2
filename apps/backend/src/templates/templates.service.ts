import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TemplatesService {
    constructor(private readonly db: DatabaseService) { }

    async findAll() {
        return this.db.query(`SELECT * FROM page_templates ORDER BY name ASC`);
    }

    async findOne(id: string) {
        return this.db.queryOne(`SELECT * FROM page_templates WHERE id = $1`, [id]);
    }

    async create(data: any) {
        return this.db.queryOne(
            `INSERT INTO page_templates (name, description, modules) VALUES ($1, $2, $3) RETURNING *`,
            [data.name, data.description || null, JSON.stringify(data.modules)],
        );
    }

    async update(id: string, data: any) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.name !== undefined) { fields.push(`name = $${idx}`); values.push(data.name); idx++; }
        if (data.description !== undefined) { fields.push(`description = $${idx}`); values.push(data.description); idx++; }
        if (data.modules !== undefined) { fields.push(`modules = $${idx}`); values.push(JSON.stringify(data.modules)); idx++; }

        if (fields.length === 0) return this.findOne(id);
        values.push(id);

        return this.db.queryOne(
            `UPDATE page_templates SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values,
        );
    }

    async delete(id: string) {
        await this.db.execute(`DELETE FROM page_templates WHERE id = $1`, [id]);
        return { deleted: true };
    }
}
