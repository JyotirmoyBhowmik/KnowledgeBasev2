import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('api/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) { }

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }

  @Get('tree')
  getTree() {
    // In a real app we'd extract roles from req.user
    return this.sectionsService.getTree([]);
  }

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sectionsService.findBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }

  @Patch('reorder')
  reorder(@Body() body: { orderedIds: string[] }) {
    return this.sectionsService.reorder(body.orderedIds);
  }
}
