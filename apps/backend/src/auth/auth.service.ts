import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly db: DatabaseService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.db.queryOne(
            `SELECT u.*, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             WHERE u.email = $1
             GROUP BY u.id`,
            [email],
        );

        if (!user || !user.password_hash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        const roles = (user.roles || []).map((ur: any) => ur.role.name);

        const payload = {
            sub: user.id,
            email: user.email,
            roles,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles,
            },
        };
    }

    async register(email: string, password: string, name?: string) {
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await this.db.queryOne(
            `INSERT INTO users (email, password_hash, name, auth_source) VALUES ($1, $2, $3, 'local') RETURNING *`,
            [email, password_hash, name || null],
        );

        // Assign default 'viewer' role
        const viewerRole = await this.db.queryOne(`SELECT id FROM roles WHERE name = 'viewer'`);
        if (viewerRole && user) {
            await this.db.execute(
                `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [user.id, viewerRole.id],
            );
        }

        return { id: user!.id, email: user!.email, name: user!.name };
    }

    async getProfile(userId: string) {
        const user = await this.db.queryOne(
            `SELECT u.*, COALESCE(json_agg(json_build_object('role', json_build_object('name', r.name, 'id', r.id)))
             FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             LEFT JOIN roles r ON r.id = ur.role_id
             WHERE u.id = $1
             GROUP BY u.id`,
            [userId],
        );

        if (!user) throw new UnauthorizedException('User not found');

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: (user.roles || []).map((ur: any) => ur.role.name),
        };
    }
}
