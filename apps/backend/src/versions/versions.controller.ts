import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/pages')
@UseGuards(JwtAuthGuard)
export class VersionsController {
    constructor(private readonly versionsService: VersionsService) { }

    @Post(':id/snapshot')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super_admin', 'contributor')
    snapshot(@Param('id') id: string, @Request() req: any) {
        return this.versionsService.snapshot(id, req.user?.sub);
    }

    @Get(':id/versions')
    findAll(@Param('id') id: string) {
        return this.versionsService.findAll(id);
    }

    @Post(':id/versions/:versionId/restore')
    @UseGuards(RolesGuard)
    @Roles('admin', 'super_admin')
    restore(@Param('id') id: string, @Param('versionId') versionId: string) {
        return this.versionsService.restore(id, versionId);
    }
}
