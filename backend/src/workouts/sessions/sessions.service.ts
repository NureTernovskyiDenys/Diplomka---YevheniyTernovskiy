import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkoutSession } from './schemas/workout-session.schema';
import { Workout } from '../schemas/workout.schema';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(WorkoutSession.name)
    private sessionModel: Model<WorkoutSession>,
    @InjectModel(Workout.name) private workoutModel: Model<Workout>,
  ) {}

  async startSession(
    userId: string,
    workoutId: string,
  ): Promise<WorkoutSession> {
    if (!Types.ObjectId.isValid(workoutId)) {
      throw new BadRequestException('Invalid Workout ID format');
    }

    const workout = await this.workoutModel
      .findOne({ _id: workoutId, user: userId })
      .exec();
    if (!workout) throw new NotFoundException('Workout not found');

    const session = new this.sessionModel({
      user: userId,
      workout: workoutId,
      startTime: new Date(),
      status: 'in_progress',
    });

    return session.save();
  }

  async logSet(
    userId: string,
    sessionId: string,
    exerciseData: { exerciseId: string; name?: string; target?: string },
    setData: { reps: number; weight: number; duration: number },
  ): Promise<WorkoutSession> {
    if (!Types.ObjectId.isValid(sessionId))
      throw new BadRequestException('Invalid Session ID');

    const session = await this.sessionModel.findOne({
      _id: sessionId,
      user: userId,
      status: 'in_progress',
    });
    if (!session) throw new NotFoundException('Active session not found');

    const existingExerciseIndex = session.exercises.findIndex(
      (ex) => ex.exerciseId === exerciseData.exerciseId,
    );

    if (existingExerciseIndex >= 0) {
      // Push set to existing exercise
      session.exercises[existingExerciseIndex].sets.push(setData);
    } else {
      // Create new exercise block
      session.exercises.push({
        exerciseId: exerciseData.exerciseId,
        name: exerciseData.name || 'Unknown',
        target: exerciseData.target || 'Unknown',
        sets: [setData],
      });
    }

    return session.save();
  }

  async finishSession(
    userId: string,
    sessionId: string,
  ): Promise<WorkoutSession> {
    if (!Types.ObjectId.isValid(sessionId))
      throw new BadRequestException('Invalid Session ID');

    const session = await this.sessionModel.findOne({
      _id: sessionId,
      user: userId,
      status: 'in_progress',
    });
    if (!session) throw new NotFoundException('Active session not found');

    session.endTime = new Date();
    session.status = 'completed';

    // Calculate total duration
    session.totalDuration = Math.round(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000,
    );

    // Calculate total volume (weight * reps)
    let volume = 0;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        volume += set.weight * set.reps;
      });
    });
    session.totalVolume = volume;

    return session.save();
  }

  async getSessionsHistory(userId: string): Promise<WorkoutSession[]> {
    return this.sessionModel
      .find({ user: userId, status: 'completed' })
      .populate('workout', 'name label')
      .sort({ startTime: -1 })
      .exec();
  }

  async createClientSession(
    userId: string,
    dto: CreateSessionDto,
  ): Promise<WorkoutSession> {
    const workout = await this.workoutModel
      .findOne({ _id: dto.workoutId, user: userId })
      .exec();
    if (!workout) throw new NotFoundException('Workout not found');

    const startTime = new Date(dto.startedAt);
    const endTime = dto.finishedAt ? new Date(dto.finishedAt) : undefined;
    const totalDuration =
      dto.durationSec ??
      (endTime
        ? Math.max(
            0,
            Math.round((endTime.getTime() - startTime.getTime()) / 1000),
          )
        : 0);

    let totalVolume = 0;
    for (const ex of dto.exercises) {
      for (const set of ex.sets) {
        totalVolume += set.weight * set.reps;
      }
    }

    const created = new this.sessionModel({
      user: userId,
      workout: dto.workoutId,
      startTime,
      endTime,
      totalDuration,
      totalVolume,
      status: endTime ? 'completed' : 'in_progress',
      exercises: dto.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: '',
        target: '',
        sets: ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          duration: 0,
          completedAt: new Date(s.completedAt || new Date().toISOString()),
          rpe: s.rpe,
        })),
      })),
    });

    return created.save();
  }

  // FIXED: Explicitly typed the filter object instead of using 'any'
  async listClientSessions(
    userId: string,
    workoutId?: string,
  ): Promise<WorkoutSession[]> {
    const filter: { user: string; workout?: string } = { user: userId };

    if (workoutId) {
      filter.workout = workoutId;
    }

    return this.sessionModel.find(filter).sort({ startTime: -1 }).exec();
  }

  // FIXED: Used the imported CreateSessionDto instead of the inline import
  async createCompleteSession(
    userId: string,
    dto: CreateSessionDto,
  ): Promise<WorkoutSession> {
    if (!Types.ObjectId.isValid(dto.workoutId)) {
      throw new BadRequestException('Invalid Workout ID format');
    }

    const workout = await this.workoutModel
      .findOne({ _id: dto.workoutId, user: userId })
      .exec();
    if (!workout) throw new NotFoundException('Workout not found');

    // Build session in one shot — mobile sends already-completed payload.
    const exercises = dto.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: 'Logged exercise',
      target: 'Mixed',
      sets: ex.sets.map((s) => ({
        reps: s.reps,
        weight: s.weight,
        duration: 0,
      })),
    }));

    const totalVolume = exercises.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0,
    );

    const startedAt = new Date(dto.startedAt);
    const finishedAt = dto.finishedAt ? new Date(dto.finishedAt) : new Date();
    const totalDuration =
      dto.durationSec ??
      Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000);

    const session = new this.sessionModel({
      user: userId,
      workout: dto.workoutId,
      startTime: startedAt,
      endTime: finishedAt,
      totalDuration,
      totalVolume,
      exercises,
      status: 'completed',
    });

    return session.save();
  }

  async listForWorkout(
    userId: string,
    workoutId: string,
  ): Promise<WorkoutSession[]> {
    if (!Types.ObjectId.isValid(workoutId)) {
      throw new BadRequestException('Invalid Workout ID format');
    }
    return this.sessionModel
      .find({ user: userId, workout: workoutId, status: 'completed' })
      .sort({ startTime: -1 })
      .exec();
  }
}
