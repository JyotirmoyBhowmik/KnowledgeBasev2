import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) { }

  // ── Public endpoints ────────────────────────────────
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  // ── Authenticated endpoints ─────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'contributor')
  create(@Body() dto: CreatePageDto, @Request() req: any) {
    return this.pagesService.create({ ...dto, created_by_id: req.user?.sub } as any, req.ip);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('sectionId') sectionId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pagesService.findAll(
      sectionId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('admin/trashed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  findTrashed() {
    return this.pagesService.findTrashed();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'contributor')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto, @Request() req: any) {
    return this.pagesService.update(id, dto, req.user?.sub, req.ip);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'contributor')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.remove(id, req.user?.sub, req.ip);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  publish(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.publish(id, req.user?.sub, req.ip);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  archive(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.archive(id, req.user?.sub, req.ip);
  }

  @Patch(':id/submit-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'contributor')
  submitForReview(@Param('id') id: string) {
    return this.pagesService.submitForReview(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.approve(id, req.user?.sub, req.ip);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  reject(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.reject(id, req.user?.sub, req.ip);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.restore(id, req.user?.sub, req.ip);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  permanentDelete(@Param('id') id: string) {
    return this.pagesService.permanentDelete(id);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'contributor')
  duplicate(@Param('id') id: string, @Request() req: any) {
    return this.pagesService.duplicate(id, req.user?.sub, req.ip);
  }
}
