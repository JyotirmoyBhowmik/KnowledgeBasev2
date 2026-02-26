import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('api/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findAll();
    }

    @Get(':key')
    findOne(@Param('key') key: string) {
        return this.settingsService.findOne(key);
    }

    @Patch(':key')
    update(@Param('key') key: string, @Body('value') value: string) {
        return this.settingsService.update(key, value);
    }
}
