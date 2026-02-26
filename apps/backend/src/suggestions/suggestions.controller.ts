import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/suggestions')
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createSuggestionDto: CreateSuggestionDto, @Request() req: any) {
        return this.suggestionsService.create(createSuggestionDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.suggestionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.suggestionsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSuggestionDto: UpdateSuggestionDto) {
        return this.suggestionsService.update(id, updateSuggestionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.suggestionsService.remove(id);
    }
}
