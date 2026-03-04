import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { Workout } from '../workouts/schemas/workout.schema';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<Session>,
        @InjectModel(Workout.name) private workoutModel: Model<Workout>,
    ) { }

    async recordSession(userId: string, recordDto: any) {
        // Optionally fetch workout to auto-calculate volume if not provided
        let totalVolume = recordDto.totalVolume;
        if (!totalVolume && recordDto.workoutId) {
            const workout = await this.workoutModel.findById(recordDto.workoutId).exec();
            if (workout) {
                totalVolume = workout.exercises.reduce((acc, ex) => acc + (ex.sets * ex.reps * ex.weight), 0);
            }
        }

        const createdSession = new this.sessionModel({
            user: userId,
            workout: recordDto.workoutId,
            durationInMinutes: recordDto.durationInMinutes,
            caloriesBurned: recordDto.caloriesBurned,
            totalVolume: totalVolume || 0,
        });
        return createdSession.save();
    }

    async getSessions(userId: string) {
        return this.sessionModel.find({ user: userId }).populate('workout').exec();
    }

    async getAggregatedStats(userId: string) {
        const sessions = await this.sessionModel.find({ user: userId }).exec();

        let totalTime = 0;
        let totalCalories = 0;
        let totalVolume = 0;

        sessions.forEach(session => {
            totalTime += session.durationInMinutes;
            totalCalories += session.caloriesBurned;
            totalVolume += session.totalVolume;
        });

        return {
            sessionCount: sessions.length,
            totalTime,
            totalCalories,
            totalVolume,
        };
    }
}
