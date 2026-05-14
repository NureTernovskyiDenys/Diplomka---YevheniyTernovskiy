import { BaseService } from './HttpClient';
import { Exercise } from '../models/Exercise';

export class ExercisesService extends BaseService {
    private unwrap(raw: any): any[] {
        if (Array.isArray(raw)) return raw;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
    }

    async list(offset = 0, limit = 30): Promise<Exercise[]> {
        const res = await this.http.get<any>('/exercises', { params: { offset, limit } });
        return Exercise.fromArray(this.unwrap(res));
    }

    async search(query: string, offset = 0, limit = 30): Promise<Exercise[]> {
        const res = await this.http.get<any>('/exercises/search', { params: { q: query, offset, limit } });
        return Exercise.fromArray(this.unwrap(res));
    }

    async byTarget(target: string): Promise<Exercise[]> {
        const res = await this.http.get<any>(`/exercises/target/${encodeURIComponent(target)}`);
        return Exercise.fromArray(this.unwrap(res));
    }

    async byEquipment(equipment: string): Promise<Exercise[]> {
        const res = await this.http.get<any>(`/exercises/equipment/${encodeURIComponent(equipment)}`);
        return Exercise.fromArray(this.unwrap(res));
    }

    async byId(id: string): Promise<Exercise> {
        const res = await this.http.get<any>(`/exercises/${encodeURIComponent(id)}`);
        const payload = res?.data ?? res;
        return Exercise.fromJson(payload);
    }
}
