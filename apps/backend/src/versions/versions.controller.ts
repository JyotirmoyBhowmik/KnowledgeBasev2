import { Controller, Get, Post, Param } from '@nestjs/common';
import { VersionsService } from './versions.service';

@Controller('api/pages')
export class VersionsController {
    constructor(private readonly versionsService: VersionsService) { }

    @Post(':id/snapshot')
    snapshot(@Param('id') id: string) {
        return this.versionsService.snapshot(id);
    }

    @Get(':id/versions')
    findAll(@Param('id') id: string) {
        return this.versionsService.findAll(id);
    }

    @Post(':id/versions/:versionId/restore')
    restore(@Param('id') id: string, @Param('versionId') versionId: string) {
        return this.versionsService.restore(id, versionId);
    }
}
