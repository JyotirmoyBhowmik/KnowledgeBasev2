import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
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
  create(@Request() req: any, @Body() dto: CreateModuleDto) {
    return this.modulesService.create(req.user?.id, req.ip, dto);
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
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(req.user?.id, req.ip, id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin', 'contributor')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.modulesService.remove(req.user?.id, req.ip, id);
  }

  @Patch('reorder/:pageId')
  @Roles('admin', 'super_admin', 'contributor')
  reorder(@Request() req: any, @Param('pageId') pageId: string, @Body() body: { orderedIds: string[] }) {
    return this.modulesService.reorder(req.user?.id, req.ip, pageId, body.orderedIds);
  }
}
