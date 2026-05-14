import {
  Controller,
  Post,
  Param,
  Body,
  Put,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// 1. Tell TypeScript exactly what 'req' looks like to fix the unsafe-member-access errors
interface RequestWithUser extends Request {
  user: {
    _id: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // === Mobile-style: create a finished session in one POST ===
  // POST /workout-sessions
  @Post('workout-sessions')
  async createComplete(
    @Request() req: RequestWithUser, // 2. Applied the type here
    @Body() body: CreateSessionDto,
  ) {
    return this.sessionsService.createCompleteSession(req.user._id, body);
  }

  // GET /workout-sessions?workoutId=...
  @Get('workout-sessions')
  async listByWorkout(
    @Request() req: RequestWithUser,
    @Query('workoutId') workoutId: string,
  ) {
    return this.sessionsService.listForWorkout(req.user._id, workoutId);
  }

  // === Legacy real-time endpoints (kept for future use) ===
  @Post('workouts/:id/sessions')
  async startSession(
    @Request() req: RequestWithUser,
    @Param('id') workoutId: string,
  ) {
    return this.sessionsService.startSession(req.user._id, workoutId);
  }

  @Put('workouts/sessions/:sessionId/exercises/:exerciseId/sets')
  async logSet(
    @Request() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
    @Body()
    body: {
      name: string;
      target: string;
      reps: number;
      weight: number;
      duration: number;
    },
  ) {
    return this.sessionsService.logSet(
      req.user._id,
      sessionId,
      { exerciseId, name: body.name, target: body.target },
      { reps: body.reps, weight: body.weight, duration: body.duration },
    );
  }

  @Put('workouts/sessions/:sessionId/finish')
  async finishSession(
    @Request() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.finishSession(req.user._id, sessionId);
  }

  @Get('workouts/history/sessions')
  async getHistory(@Request() req: RequestWithUser) {
    return this.sessionsService.getSessionsHistory(req.user._id);
  }
}
