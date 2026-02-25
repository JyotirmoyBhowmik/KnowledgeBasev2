import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } },
        });

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
        const roles = user.roles.map((ur) => ur.role.name);

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

        const user = await this.prisma.user.create({
            data: { email, password_hash, name, auth_source: 'local' },
        });

        // Assign default 'viewer' role
        const viewerRole = await this.prisma.role.findUnique({
            where: { name: 'viewer' },
        });

        if (viewerRole) {
            await this.prisma.userRole.create({
                data: { user_id: user.id, role_id: viewerRole.id },
            });
        }

        return { id: user.id, email: user.email, name: user.name };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: { include: { role: true } } },
        });

        if (!user) throw new UnauthorizedException('User not found');

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles.map((ur) => ur.role.name),
        };
    }
}
