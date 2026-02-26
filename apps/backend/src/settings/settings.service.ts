import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.setting.findMany();
    }

    async findOne(key: string) {
        return this.prisma.setting.findUnique({
            where: { key },
        });
    }

    async update(key: string, value: string) {
        return this.prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}
