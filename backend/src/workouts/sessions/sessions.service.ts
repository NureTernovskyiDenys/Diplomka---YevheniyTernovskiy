import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkoutSession } from './schemas/workout-session.schema';
import { Workout } from '../schemas/workout.schema';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(WorkoutSession.name) private sessionModel: Model<WorkoutSession>,
        @InjectModel(Workout.name) private workoutModel: Model<Workout>
    ) { }

    async startSession(userId: string, workoutId: string): Promise<WorkoutSession> {
        if (!Types.ObjectId.isValid(workoutId)) {
            throw new BadRequestException('Invalid Workout ID format');
        }

        const workout = await this.workoutModel.findOne({ _id: workoutId, user: userId }).exec();
        if (!workout) throw new NotFoundException('Workout not found');

        const session = new this.sessionModel({
            user: userId,
            workout: workoutId,
            startTime: new Date(),
            status: 'in_progress'
        });

        return session.save();
    }

    async logSet(
        userId: string,
        sessionId: string,
        exerciseData: { exerciseId: string; name?: string; target?: string },
        setData: { reps: number; weight: number; duration: number }
    ): Promise<WorkoutSession> {
        if (!Types.ObjectId.isValid(sessionId)) throw new BadRequestException('Invalid Session ID');

        const session = await this.sessionModel.findOne({ _id: sessionId, user: userId, status: 'in_progress' });
        if (!session) throw new NotFoundException('Active session not found');

        const existingExerciseIndex = session.exercises.findIndex(ex => ex.exerciseId === exerciseData.exerciseId);

        if (existingExerciseIndex >= 0) {
            // Push set to existing exercise
            session.exercises[existingExerciseIndex].sets.push(setData);
        } else {
            // Create new exercise block
            session.exercises.push({
                exerciseId: exerciseData.exerciseId,
                name: exerciseData.name || 'Unknown',
                target: exerciseData.target || 'Unknown',
                sets: [setData]
            });
        }

        return session.save();
    }

    async finishSession(userId: string, sessionId: string): Promise<WorkoutSession> {
        if (!Types.ObjectId.isValid(sessionId)) throw new BadRequestException('Invalid Session ID');

        const session = await this.sessionModel.findOne({ _id: sessionId, user: userId, status: 'in_progress' });
        if (!session) throw new NotFoundException('Active session not found');

        session.endTime = new Date();
        session.status = 'completed';

        // Calculate total duration
        session.totalDuration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000);

        // Calculate total volume (weight * reps)
        let volume = 0;
        session.exercises.forEach(ex => {
            ex.sets.forEach(set => {
                volume += (set.weight * set.reps);
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
}
