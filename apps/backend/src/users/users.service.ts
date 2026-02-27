import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivityService } from '../activity/activity.service';
import * as bcrypt from 'bcrypt';

// Columns to return for users (excludes password_hash)
const USER_SAFE_COLS = 'u.id, u.email, u.name, u.auth_source, u.status, u.created_at, u.updated_at';

@Injectable()
export class UsersService {
    constructor(
        private readonly db: DatabaseService,
        private readonly activity: ActivityService
    ) { }

    async findAll() {
        return this.db.query(
            `SELECT ${USER_SAFE_COLS}, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             GROUP BY u.id, u.email, u.name, u.auth_source, u.status, u.created_at, u.updated_at
             ORDER BY u.created_at DESC`,
        );
    }

    async findOne(id: string) {
        const user = await this.db.queryOne(
            `SELECT ${USER_SAFE_COLS}, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             WHERE u.id = $1
             GROUP BY u.id, u.email, u.name, u.auth_source, u.status, u.created_at, u.updated_at`,
            [id],
        );
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async create(data: any) {
        // Check duplicate email
        const existing = await this.db.queryOne(`SELECT id FROM users WHERE email = $1`, [data.email]);
        if (existing) throw new ConflictException(`User with email "${data.email}" already exists`);

        let password_hash: string | null = null;
        if (data.password) {
            const salt = await bcrypt.genSalt(12);
            password_hash = await bcrypt.hash(data.password, salt);
        }

        const user = await this.db.queryOne(
            `INSERT INTO users (email, name, password_hash, auth_source, status)
             VALUES ($1, $2, $3, 'local', 'active') RETURNING id`,
            [data.email, data.name || null, password_hash],
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

    async update(userId: string, data: any, adminId: string) {
        // Prevent setting the email to an already existing one
        if (data.email) {
            const existing = await this.db.queryOne(`SELECT id FROM users WHERE email = $1 AND id != $2`, [data.email, userId]);
            if (existing) throw new ConflictException(`User with email "${data.email}" already exists`);
        }

        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email); }
        if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }

        if (fields.length > 0) {
            values.push(userId);
            await this.db.execute(
                `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
                values
            );
        }

        if (data.role) {
            // First clear old roles
            await this.db.execute(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
            await this.assignRole(userId, data.role);
        }

        this.activity.log(adminId, 'edited', 'user', userId, `Admin modified user ${userId}`).catch(() => { });
        return this.findOne(userId);
    }

    async assignRole(userId: string, roleName: string) {
        const role = await this.db.queryOne(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);
        await this.db.execute(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, role.id],
        );
        return this.findOne(userId);
    }

    async removeRole(userId: string, roleName: string) {
        const role = await this.db.queryOne(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);
        await this.db.execute(`DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, [userId, role.id]);
        return this.findOne(userId);
    }

    async deactivate(userId: string, adminId?: string) {
        await this.db.execute(`UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = $1`, [userId]);
        if (adminId) this.activity.log(adminId, 'deleted', 'user', userId, `Admin deactivated user ${userId}`).catch(() => { });
        return this.findOne(userId);
    }

    async activate(userId: string, adminId?: string) {
        await this.db.execute(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [userId]);
        if (adminId) this.activity.log(adminId, 'edited', 'user', userId, `Admin reactivated user ${userId}`).catch(() => { });
        return this.findOne(userId);
    }
}
