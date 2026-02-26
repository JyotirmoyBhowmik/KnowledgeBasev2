import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
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
