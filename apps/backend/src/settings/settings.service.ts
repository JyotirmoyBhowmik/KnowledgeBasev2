import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class SettingsService {
    constructor(
        private db: DatabaseService,
        private activity: ActivityService
    ) { }

    async findAll() {
        return this.db.query(`SELECT * FROM settings ORDER BY key ASC`);
    }

    async findOne(key: string) {
        return this.db.queryOne(`SELECT * FROM settings WHERE key = $1`, [key]);
    }

    async update(key: string, value: string) {
        const result = await this.db.queryOne(
            `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
             RETURNING *`,
            [key, value],
        );

        if (key === 'activity_log_retention_days') {
            const days = parseInt(value, 10);
            if (!isNaN(days) && days > 0) {
                this.activity.cleanupOldLogs(days).catch(() => { });
            }
        }

        return result;
    }
}
