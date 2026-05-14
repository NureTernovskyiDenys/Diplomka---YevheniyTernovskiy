import { BaseService } from './HttpClient';
import { WorkoutSession, ExerciseLog } from '../models/WorkoutSession';

export interface CreateSessionPayload {
    workoutId: string;
    startedAt: string;
    finishedAt: string;
    durationSec: number;
    exercises: ExerciseLog[];
}

export class WorkoutSessionsService extends BaseService {
    async listForWorkout(workoutId: string): Promise<WorkoutSession[]> {
        const res = await this.http.get<any[]>(`/workout-sessions`, { params: { workoutId } });
        return WorkoutSession.fromArray(res);
    }

    async getLast(workoutId: string): Promise<WorkoutSession | null> {
        const list = await this.listForWorkout(workoutId);
        if (!list.length) return null;
        return list.sort((a, b) =>
            new Date(b.data.finishedAt ?? b.data.startedAt).getTime() -
            new Date(a.data.finishedAt ?? a.data.startedAt).getTime()
        )[0];
    }

    async create(payload: CreateSessionPayload): Promise<WorkoutSession> {
        const res = await this.http.post<any>('/workout-sessions', payload);
        return WorkoutSession.fromJson(res);
    }
}