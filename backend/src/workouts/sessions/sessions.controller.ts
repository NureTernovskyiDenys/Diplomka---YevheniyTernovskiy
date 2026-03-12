import { Controller, Post, Param, Body, Put, UseGuards, Request, Get } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post(':id/sessions')
    async startSession(@Request() req, @Param('id') workoutId: string) {
        return this.sessionsService.startSession(req.user._id, workoutId);
    }

    @Put('sessions/:sessionId/exercises/:exerciseId/sets')
    async logSet(
        @Request() req,
        @Param('sessionId') sessionId: string,
        @Param('exerciseId') exerciseId: string,
        @Body() body: { name: string; target: string; reps: number; weight: number; duration: number }
    ) {
        return this.sessionsService.logSet(
            req.user._id,
            sessionId,
            { exerciseId, name: body.name, target: body.target },
            { reps: body.reps, weight: body.weight, duration: body.duration }
        );
    }

    @Put('sessions/:sessionId/finish')
    async finishSession(@Request() req, @Param('sessionId') sessionId: string) {
        return this.sessionsService.finishSession(req.user._id, sessionId);
    }

    @Get('history/sessions')
    async getHistory(@Request() req) {
        return this.sessionsService.getSessionsHistory(req.user._id);
    }
}
