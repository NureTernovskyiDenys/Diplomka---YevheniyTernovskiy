import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('sessions')
    recordSession(@Request() req: any, @Body() recordDto: any) {
        return this.analyticsService.recordSession(req.user._id, recordDto);
    }

    @Get('sessions')
    getSessions(@Request() req: any) {
        return this.analyticsService.getSessions(req.user._id);
    }

    @Get('stats')
    getStats(@Request() req: any) {
        return this.analyticsService.getAggregatedStats(req.user._id);
    }
}
