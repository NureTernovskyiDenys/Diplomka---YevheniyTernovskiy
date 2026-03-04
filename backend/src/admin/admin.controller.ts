import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('subscriptions')
    getAllSubscriptions() {
        return this.adminService.getAllSubscriptions();
    }

    @Put('users/:id/role')
    setRole(@Param('id') userId: string, @Body('role') role: string) {
        return this.adminService.setRole(userId, role);
    }
}
