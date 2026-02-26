import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('api/activity')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    findAll(
        @Query('userId') userId?: string,
        @Query('entityType') entityType?: string,
        @Query('limit') limit?: string,
    ) {
        return this.activityService.findAll({
            userId,
            entityType,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
}
