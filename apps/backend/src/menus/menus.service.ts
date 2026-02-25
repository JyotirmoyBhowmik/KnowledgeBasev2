import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) { }

  create(dto: CreateMenuDto) {
    return this.prisma.menu.create({ data: dto });
  }

  /** Returns a flat list of all menus – the frontend builds the tree. */
  findAll() {
    return this.prisma.menu.findMany({
      orderBy: { order: 'asc' },
      include: { children: { orderBy: { order: 'asc' } } },
    });
  }

  /** Returns the full tree starting from root nodes. */
  async getTree(userRoles?: string[]) {
    const all = await this.prisma.menu.findMany({
      where: { visible: true },
      orderBy: { order: 'asc' },
    });

    // Filter by roles if provided
    const filtered = userRoles
      ? all.filter((m) => {
        if (!m.roles_allowed) return true; // public
        const allowed = m.roles_allowed as string[];
        if (allowed.length === 0) return true;
        return allowed.some((r) => userRoles.includes(r));
      })
      : all.filter((m) => !m.roles_allowed || (m.roles_allowed as string[]).length === 0);

    // Build tree
    const map = new Map<string, any>();
    const roots: any[] = [];
    filtered.forEach((m) => map.set(m.id, { ...m, children: [] }));
    filtered.forEach((m) => {
      const node = map.get(m.id);
      if (m.parent_id && map.has(m.parent_id)) {
        map.get(m.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { children: { orderBy: { order: 'asc' } } },
    });
    if (!menu) throw new NotFoundException(`Menu ${id} not found`);
    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.findOne(id);
    return this.prisma.menu.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menu.delete({ where: { id } });
  }

  async reorder(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.menu.update({ where: { id }, data: { order: index } }),
    );
    return this.prisma.$transaction(updates);
  }
}
