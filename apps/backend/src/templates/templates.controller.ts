import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('api/templates')
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
