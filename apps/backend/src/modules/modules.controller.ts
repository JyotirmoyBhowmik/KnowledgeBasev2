import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) { }

  @Post()
  @Roles('admin', 'super_admin', 'contributor')
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
  @Roles('admin', 'super_admin', 'contributor')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin', 'contributor')
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }

  @Patch('reorder/:pageId')
  @Roles('admin', 'super_admin', 'contributor')
  reorder(@Param('pageId') pageId: string, @Body() body: { orderedIds: string[] }) {
    return this.modulesService.reorder(pageId, body.orderedIds);
  }
}
