import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreatePageDto) {
    return this.prisma.page.create({
      data: dto,
      include: { section: true },
    });
  }

  findAll(sectionId?: string) {
    return this.prisma.page.findMany({
      where: {
        deleted_at: null,
        ...(sectionId ? { section_id: sectionId } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: { section: true, modules: { where: { deleted_at: null }, orderBy: { order: 'asc' } } },
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, deleted_at: null },
      include: {
        section: true,
        modules: { where: { deleted_at: null }, orderBy: { order: 'asc' } },
        created_by: { select: { id: true, email: true, name: true } },
        updated_by: { select: { id: true, email: true, name: true } },
      },
    });
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, deleted_at: null },
      include: {
        section: true,
        modules: { where: { deleted_at: null }, orderBy: { order: 'asc' } },
      },
    });
    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.findOne(id);
    return this.prisma.page.update({
      where: { id },
      data: dto,
      include: { section: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Soft delete
    return this.prisma.page.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async publish(id: string, userId?: string) {
    await this.findOne(id);
    return this.prisma.page.update({
      where: { id },
      data: { status: 'published', updated_by_id: userId },
    });
  }

  async archive(id: string, userId?: string) {
    await this.findOne(id);
    return this.prisma.page.update({
      where: { id },
      data: { status: 'archived', updated_by_id: userId },
    });
  }
}
