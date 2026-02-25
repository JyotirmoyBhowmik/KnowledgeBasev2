import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Controller('api/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) { }

  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @Get()
  findAll(@Query('pageId') pageId: string) {
    return this.modulesService.findAllByPage(pageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }

  @Patch('reorder/:pageId')
  reorder(@Param('pageId') pageId: string, @Body() body: { orderedIds: string[] }) {
    return this.modulesService.reorder(pageId, body.orderedIds);
  }
}
