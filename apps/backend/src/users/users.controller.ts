import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.usersService.create(body);
    }

    @Patch(':id/roles')
    assignRole(@Param('id') id: string, @Body() body: { role: string }) {
        return this.usersService.assignRole(id, body.role);
    }

    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.usersService.activate(id);
    }
}
