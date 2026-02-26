import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
    constructor(private db: DatabaseService) { }

    async findAll() {
        return this.db.query(`SELECT * FROM settings`);
    }

    async findOne(key: string) {
        return this.db.queryOne(`SELECT * FROM settings WHERE key = $1`, [key]);
    }

    async update(key: string, value: string) {
        // Upsert: insert or update
        return this.db.queryOne(
            `INSERT INTO settings (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
             RETURNING *`,
            [key, value],
        );
    }
}
