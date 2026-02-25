import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreateModuleDto) {
    return this.prisma.module.create({ data: dto });
  }

  findAllByPage(pageId: string) {
    return this.prisma.module.findMany({
      where: { page_id: pageId, deleted_at: null },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const mod = await this.prisma.module.findFirst({
      where: { id, deleted_at: null },
    });
    if (!mod) throw new NotFoundException(`Module ${id} not found`);
    return mod;
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.module.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async reorder(pageId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.module.update({ where: { id }, data: { order: index } }),
    );
    return this.prisma.$transaction(updates);
  }
}
