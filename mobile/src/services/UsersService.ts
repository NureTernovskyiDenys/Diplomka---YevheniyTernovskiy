import { BaseService } from './HttpClient';
import { User, UserProfileData } from '../models/User';

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    profile?: Partial<UserProfileData>;
}

export class UsersService extends BaseService {
    async getById(id: string): Promise<User> {
        const res = await this.http.get<any>(`/users/${id}`);
        return User.fromJson(res);
    }

    async update(id: string, payload: UpdateUserPayload): Promise<User> {
        const res = await this.http.put<any>(`/users/${id}`, payload);
        return User.fromJson(res);
    }
}
