import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreateSectionDto) {
    return this.prisma.section.create({ data: dto });
  }

  findAll() {
    return this.prisma.section.findMany({
      orderBy: { order: 'asc' },
      include: { pages: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } } },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { pages: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } } },
    });
    if (!section) throw new NotFoundException(`Section ${id} not found`);
    return section;
  }

  async findBySlug(slug: string) {
    const section = await this.prisma.section.findUnique({
      where: { slug },
      include: { pages: { where: { deleted_at: null, status: 'published' }, orderBy: { created_at: 'desc' } } },
    });
    if (!section) throw new NotFoundException(`Section "${slug}" not found`);
    return section;
  }

  async update(id: string, dto: UpdateSectionDto) {
    await this.findOne(id);
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.section.delete({ where: { id } });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.section.update({ where: { id }, data: { order: index } }),
    );
    return this.prisma.$transaction(updates);
  }
}
