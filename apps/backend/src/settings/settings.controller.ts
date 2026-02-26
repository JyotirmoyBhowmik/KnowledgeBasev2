import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() { return this.settingsService.findAll(); }

    @Get(':key')
    findOne(@Param('key') key: string) { return this.settingsService.findOne(key); }

    @Patch(':key')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    update(@Param('key') key: string, @Body('value') value: string) {
        return this.settingsService.update(key, value);
    }
}
