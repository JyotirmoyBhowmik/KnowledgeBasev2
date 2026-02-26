import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly db: DatabaseService) { }

    async findAll() {
        return this.db.query(
            `SELECT u.*, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             GROUP BY u.id
             ORDER BY u.created_at DESC`,
        );
    }

    async findOne(id: string) {
        const user = await this.db.queryOne(
            `SELECT u.*, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             WHERE u.id = $1
             GROUP BY u.id`,
            [id],
        );
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async create(data: any) {
        const user = await this.db.queryOne(
            `INSERT INTO users (email, name, auth_source, status) VALUES ($1, $2, 'local', 'active') RETURNING *`,
            [data.email, data.name || null],
        );

        if (data.role && user) {
            const role = await this.db.queryOne(`SELECT id FROM roles WHERE name = $1`, [data.role]);
            if (role) {
                await this.db.execute(
                    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [user.id, role.id],
                );
            }
        }

        return this.findOne(user!.id);
    }

    async assignRole(userId: string, roleName: string) {
        const role = await this.db.queryOne(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

        await this.db.execute(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, role.id],
        );
        return { user_id: userId, role_id: role.id };
    }

    async removeRole(userId: string, roleName: string) {
        const role = await this.db.queryOne(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

        await this.db.execute(
            `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
            [userId, role.id],
        );
    }

    async deactivate(userId: string) {
        return this.db.queryOne(
            `UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
            [userId],
        );
    }

    async activate(userId: string) {
        return this.db.queryOne(
            `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *`,
            [userId],
        );
    }
}
