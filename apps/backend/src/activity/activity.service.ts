import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ActivityService {
    constructor(private readonly db: DatabaseService) { }

    async log(userId: string, action: string, entityType: string, entityId: string, details?: string) {
        return this.db.queryOne(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, action, entityType, entityId, details || null],
        );
    }

    async findAll(filters?: { userId?: string; entityType?: string; limit?: number }) {
        const conditions: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (filters?.userId) { conditions.push(`a.user_id = $${idx}`); values.push(filters.userId); idx++; }
        if (filters?.entityType) { conditions.push(`a.entity_type = $${idx}`); values.push(filters.entityType); idx++; }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = filters?.limit || 100;
        values.push(limit);

        return this.db.query(
            `SELECT a.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS user
             FROM activity_logs a
             LEFT JOIN users u ON u.id = a.user_id
             ${where}
             ORDER BY a.created_at DESC
             LIMIT $${idx}`,
            values,
        );
    }
}
