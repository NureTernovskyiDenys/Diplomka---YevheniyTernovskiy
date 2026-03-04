import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(Role.ADMIN)
    @Post()
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @Roles(Role.ADMIN)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    // Users can view their own profile, admins can view any
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req: any) {
        if (req.user.role !== Role.ADMIN && req.user._id !== id) {
            return { message: 'Unauthorized access' };
        }
        return this.usersService.findById(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: any, @Request() req: any) {
        if (req.user.role !== Role.ADMIN && req.user._id !== id) {
            return { message: 'Unauthorized access' };
        }
        return this.usersService.update(id, updateUserDto);
    }

    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
