import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  // ── Public endpoints ────────────────────────────────
  @Get('tree')
  getTree(@Request() req: any) {
    const roles = req.user?.roles || [];
    return this.sectionsService.getTree(roles);
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sectionsService.findBySlug(slug);
  }

  // ── Admin endpoints ─────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  create(@Request() req: any, @Body() dto: CreateSectionDto) {
    return this.sectionsService.create(req.user?.id, req.ip, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(req.user?.id, req.ip, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.sectionsService.remove(req.user?.id, req.ip, id);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  reorder(@Request() req: any, @Body() body: { orderedIds: string[] }) {
    return this.sectionsService.reorder(req.user?.id, req.ip, body.orderedIds);
  }
}
