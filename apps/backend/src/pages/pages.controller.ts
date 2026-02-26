import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('api/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) { }

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    return this.pagesService.findAll(sectionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.pagesService.publish(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.pagesService.archive(id);
  }

  @Patch(':id/submit-review')
  submitForReview(@Param('id') id: string) {
    return this.pagesService.submitForReview(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.pagesService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.pagesService.reject(id);
  }

  @Get('admin/trashed')
  findTrashed() {
    return this.pagesService.findTrashed();
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.pagesService.restore(id);
  }

  @Delete(':id/permanent')
  permanentDelete(@Param('id') id: string) {
    return this.pagesService.permanentDelete(id);
  }
}
