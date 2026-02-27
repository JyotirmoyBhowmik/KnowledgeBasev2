import { Controller, Get, Param, Patch, Body, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() { return this.usersService.findAll(); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

    @Post()
    create(@Body() body: any) { return this.usersService.create(body); }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: any) {
        return this.usersService.update(id, dto, req.user.id);
    }

    @Patch(':id/roles')
    assignRole(@Param('id') id: string, @Body() body: { role: string }) {
        return this.usersService.assignRole(id, body.role);
    }

    @Delete(':id/roles')
    removeRole(@Param('id') id: string, @Body() body: { role: string }) {
        return this.usersService.removeRole(id, body.role);
    }

    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string, @Request() req: any) { return this.usersService.deactivate(id, req.user.id); }

    @Patch(':id/activate')
    activate(@Param('id') id: string, @Request() req: any) { return this.usersService.activate(id, req.user.id); }
}
