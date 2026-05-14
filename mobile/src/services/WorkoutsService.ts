import { BaseService } from './HttpClient';
import { Workout } from '../models/Workout';
import { AiRecommendation } from '../models/AiRecommendation';

export interface CreateWorkoutPayload {
    name: string;
    exercises?: { exerciseId: string; sets: number; reps: number; weight: number }[];
}

export interface UpdateExerciseFields {
    sets?: number;
    reps?: number;
    weight?: number;
}

export class WorkoutsService extends BaseService {
    async listMine(): Promise<Workout[]> {
        const res = await this.http.get<any[]>('/workouts');
        return Workout.fromArray(res);
    }

    async listPublic(search?: string, authorId?: string): Promise<Workout[]> {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (authorId) params.author = authorId;
        const res = await this.http.get<any[]>('/workouts', { params });
        return Workout.fromArray(res);
    }

    async getById(id: string): Promise<Workout> {
        const res = await this.http.get<any>(`/workouts/${id}`);
        return Workout.fromJson(res);
    }

    async create(payload: CreateWorkoutPayload): Promise<Workout> {
        const res = await this.http.post<any>('/workouts', payload);
        return Workout.fromJson(res);
    }

    async rename(id: string, name: string): Promise<Workout> {
        const res = await this.http.put<any>(`/workouts/${id}`, { name });
        return Workout.fromJson(res);
    }

    async delete(id: string): Promise<void> {
        await this.http.delete(`/workouts/${id}`);
    }

    async addExercise(workoutId: string, exerciseId: string): Promise<Workout> {
        const res = await this.http.post<any>(`/workouts/${workoutId}/exercises`, { exerciseId });
        return Workout.fromJson(res);
    }

    async updateExercise(
        workoutId: string,
        exerciseObjId: string,
        fields: UpdateExerciseFields,
    ): Promise<Workout> {
        const res = await this.http.put<any>(`/workouts/${workoutId}/exercises/${exerciseObjId}`, fields);
        return Workout.fromJson(res);
    }

    async removeExercise(workoutId: string, exerciseObjId: string): Promise<Workout> {
    const res = await this.http.delete<any>(`/workouts/${workoutId}/exercises/${exerciseObjId}`);
    return Workout.fromJson(res);
}

    async getRecommendation(workoutId: string): Promise<AiRecommendation> {
        const res = await this.http.get<any>(`/workouts/${workoutId}/recommendation`);
        return AiRecommendation.fromJson(res);
    }
}
