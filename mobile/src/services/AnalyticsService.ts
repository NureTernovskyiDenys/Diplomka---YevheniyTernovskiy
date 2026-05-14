import { BaseService } from './HttpClient';

export interface SessionPayload {
    workoutId: string;
    durationInMinutes: number;
    caloriesBurned: number;
    totalVolume?: number;
}

export interface AggregatedStats {
    totalSessions: number;
    totalCalories: number;
    totalVolume: number;
    totalMinutes: number;
}

export class AnalyticsService extends BaseService {
    async recordSession(payload: SessionPayload): Promise<any> {
        return this.http.post('/analytics/sessions', payload);
    }

    async getSessions(): Promise<any[]> {
        const res = await this.http.get<any[]>('/analytics/sessions');
        return res ?? [];
    }

    async getStats(): Promise<AggregatedStats> {
        return this.http.get<AggregatedStats>('/analytics/stats');
    }
}
