import { BaseService } from './HttpClient';
import { User } from '../models/User';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginResponse {
    access_token: string;
}

/**
 * Auth microservice client. Encapsulates JWT login/register and persists token
 * in SecureStore via the shared HttpClient.
 */
export class AuthService extends BaseService {
    async login(payload: LoginRequest): Promise<{ token: string }> {
        const res = await this.http.post<LoginResponse>('/auth/login', payload);
        await this.http.setToken(res.access_token);
        return { token: res.access_token };
    }

    async register(payload: RegisterRequest): Promise<User> {
        const res = await this.http.post<any>('/auth/register', payload);
        return User.fromJson(res);
    }

    async getProfile(): Promise<User> {
        const res = await this.http.get<any>('/auth/profile');
        // /auth/profile returns the JWT-decoded payload (sub/email/role); we
        // map it onto the User model so callers can ignore that detail.
        const normalized = {
            _id: res?._id ?? res?.sub,
            email: res?.email,
            firstName: res?.firstName ?? '',
            lastName: res?.lastName ?? '',
            role: res?.role,
        };
        return User.fromJson(normalized);
    }

    async logout(): Promise<void> {
        await this.http.clearToken();
    }
}
