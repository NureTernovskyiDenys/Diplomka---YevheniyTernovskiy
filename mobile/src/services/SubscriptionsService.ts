import { BaseService } from './HttpClient';
import { SubscriptionPlan } from '../models/Subscription';
import { User } from '../models/User';

export class SubscriptionsService extends BaseService {
    async list(): Promise<SubscriptionPlan[]> {
        const res = await this.http.get<any[]>('/subscriptions');
        return SubscriptionPlan.fromArray(res ?? []);
    }

    async subscribe(planId: string): Promise<{ message: string; user: User }> {
        const res = await this.http.post<any>(`/subscriptions/${planId}/subscribe`);
        return {
            message: res?.message ?? 'Subscribed.',
            user: User.fromJson(res?.user ?? {}),
        };
    }
}
