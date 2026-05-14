import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { ListSessionsQueryDto } from './dto/list-sessions.query.dto';
import { WorkoutSession } from './schemas/workout-session.schema';

interface ClientSetLog {
  weight: number;
  reps: number;
  completedAt: string;
  rpe?: number;
}

interface ClientExerciseLog {
  exerciseId: string;
  sets: ClientSetLog[];
}

interface ClientSession {
  _id: string;
  workoutId: string;
  userId: string;
  startedAt: string;
  finishedAt?: string;
  durationSec?: number;
  exercises: ClientExerciseLog[];
}

const toIso = (v: any): string | undefined => {
  if (!v) return undefined;
  return v instanceof Date ? v.toISOString() : String(v);
};

const toClientShape = (doc: WorkoutSession): ClientSession => {
  const obj: any = (doc as any).toObject ? (doc as any).toObject() : doc;
  return {
    _id: String(obj._id),
    workoutId: String(obj.workout),
    userId: String(obj.user),
    startedAt: toIso(obj.startTime) ?? new Date(0).toISOString(),
    finishedAt: toIso(obj.endTime),
    durationSec: obj.totalDuration,
    exercises: (obj.exercises ?? []).map((ex: any) => ({
      exerciseId: ex.exerciseId,
      sets: (ex.sets ?? []).map((s: any) => {
        const out: ClientSetLog = {
          weight: s.weight,
          reps: s.reps,
          completedAt:
            toIso(s.completedAt) ??
            toIso(obj.startTime) ??
            new Date(0).toISOString(),
        };
        if (s.rpe !== undefined && s.rpe !== null) out.rpe = s.rpe;
        return out;
      }),
    })),
  };
};

@UseGuards(JwtAuthGuard)
@Controller('workout-sessions')
export class ClientSessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async list(
    @Request() req: any,
    @Query() query: ListSessionsQueryDto,
  ): Promise<ClientSession[]> {
    const sessions = await this.sessionsService.listClientSessions(
      req.user._id,
      query.workoutId,
    );
    return sessions.map(toClientShape);
  }

  @Post()
  async create(
    @Request() req: any,
    @Body() dto: CreateSessionDto,
  ): Promise<ClientSession> {
    const session = await this.sessionsService.createClientSession(
      req.user._id,
      dto,
    );
    return toClientShape(session);
  }
}
