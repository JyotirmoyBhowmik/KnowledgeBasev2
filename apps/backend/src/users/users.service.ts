import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.user.findMany({
            include: { roles: { include: { role: true } } },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async assignRole(userId: string, roleName: string) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

        return this.prisma.userRole.upsert({
            where: { user_id_role_id: { user_id: userId, role_id: role.id } },
            create: { user_id: userId, role_id: role.id },
            update: {},
        });
    }

    async removeRole(userId: string, roleName: string) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) throw new NotFoundException(`Role "${roleName}" not found`);

        return this.prisma.userRole.delete({
            where: { user_id_role_id: { user_id: userId, role_id: role.id } },
        });
    }

    async deactivate(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'inactive' },
        });
    }

    async activate(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: 'active' },
        });
    }
}
