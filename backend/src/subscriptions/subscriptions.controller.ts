import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    // Admins can create new plans
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    create(@Body() createSubscriptionDto: any) {
        return this.subscriptionsService.create(createSubscriptionDto);
    }

    // Anyone can view available plans
    @Get()
    findAll() {
        return this.subscriptionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subscriptionsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Put(':id')
    update(@Param('id') id: string, @Body() updateSubscriptionDto: any) {
        return this.subscriptionsService.update(id, updateSubscriptionDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.subscriptionsService.remove(id);
    }

    // Allow user to subscribe to a standard plan
    @UseGuards(JwtAuthGuard)
    @Post(':id/subscribe')
    subscribe(@Param('id') planId: string, @Req() req: any) {
        const userId = req.user._id;
        return this.subscriptionsService.subscribeUserToPlan(userId, planId);
    }
}
