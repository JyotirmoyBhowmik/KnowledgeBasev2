import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [ActivityModule],
    controllers: [SettingsController],
    providers: [SettingsService],
})
export class SettingsModule { }
