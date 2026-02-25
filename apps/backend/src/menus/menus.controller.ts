import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('api/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) { }

  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  @Get('tree')
  getTree(@Query('roles') roles?: string) {
    const userRoles = roles ? roles.split(',') : undefined;
    return this.menusService.getTree(userRoles);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }

  @Patch('reorder')
  reorder(@Body() body: { orderedIds: string[] }) {
    return this.menusService.reorder(body.orderedIds);
  }
}
