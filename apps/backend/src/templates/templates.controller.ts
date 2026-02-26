import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Get()
    findAll() { return this.templatesService.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.templatesService.findOne(id); }

    @Post()
    create(@Body() body: any) { return this.templatesService.create(body); }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) { return this.templatesService.update(id, body); }

    @Delete(':id')
    delete(@Param('id') id: string) { return this.templatesService.delete(id); }
}
