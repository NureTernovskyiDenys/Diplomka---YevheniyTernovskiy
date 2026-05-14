import axios, { AxiosAdapter, AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { SecureStorage } from './SecureStorage';

export const TOKEN_KEY = 'jwt_token';

export type UnauthorizedHandler = () => void;

export interface HttpClientOptions {
    adapter?: AxiosAdapter;
}

/**
 * Singleton HTTP client. Shared transport across every microservice so JWT and
 * 401 handling stay consistent. Each per-domain service receives this instance
 * and only knows how to translate its own endpoints to/from domain models.
 *
 * An optional axios adapter can be injected to swap the real network layer for
 * the in-app mock server (see services/mock/MockApiServer.ts).
 */
export class HttpClient {
    private static _instance: HttpClient | null = null;
    private readonly axios: AxiosInstance;
    private unauthorizedHandlers: Set<UnauthorizedHandler> = new Set();

    private constructor(baseURL: string, options: HttpClientOptions = {}) {
        this.axios = axios.create({
            baseURL,
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' },
            adapter: options.adapter,
        });

        this.axios.interceptors.request.use(async (config) => {
            try {
                const token = await SecureStorage.getItem(TOKEN_KEY);
                if (token) {
                    (config.headers as any).Authorization = `Bearer ${token}`;
                }
            } catch {
                // Storage failures should not break requests
            }
            return config;
        });

        this.axios.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    this.unauthorizedHandlers.forEach((h) => {
                        try { h(); } catch { /* ignore */ }
                    });
                }
                return Promise.reject(error);
            },
        );
    }

    static configure(baseURL: string, options: HttpClientOptions = {}): HttpClient {
        if (!HttpClient._instance) {
            HttpClient._instance = new HttpClient(baseURL, options);
        }
        return HttpClient._instance;
    }

    static get instance(): HttpClient {
        if (!HttpClient._instance) {
            throw new Error('HttpClient not configured. Call HttpClient.configure(baseURL) first.');
        }
        return HttpClient._instance;
    }

    onUnauthorized(handler: UnauthorizedHandler): () => void {
        this.unauthorizedHandlers.add(handler);
        return () => this.unauthorizedHandlers.delete(handler);
    }

    async setToken(token: string): Promise<void> {
        await SecureStorage.setItem(TOKEN_KEY, token);
    }

    async clearToken(): Promise<void> {
        await SecureStorage.deleteItem(TOKEN_KEY);
    }

    async getToken(): Promise<string | null> {
        return SecureStorage.getItem(TOKEN_KEY);
    }

    async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.get<T>(path, config);
        return data;
    }

    async post<T>(path: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.post<T>(path, body, config);
        return data;
    }

    async put<T>(path: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.put<T>(path, body, config);
        return data;
    }

    async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
        const { data } = await this.axios.delete<T>(path, config);
        return data;
    }
}

/**
 * Base class every domain microservice extends. Provides typed access to the
 * shared singleton HttpClient and a stable seam for unit-tests to inject a mock.
 */
export abstract class BaseService {
    protected readonly http: HttpClient;
    constructor(http: HttpClient = HttpClient.instance) {
        this.http = http;
    }
}

/**
 * Convert axios errors into a flat user-facing message string.
 */
export const formatError = (err: unknown): string => {
    const e = err as AxiosError<{ message?: string | string[] }>;
    if (e?.response?.data?.message) {
        const m = e.response.data.message;
        return Array.isArray(m) ? m.join(', ') : m;
    }
    if (e?.message) return e.message;
    return 'Something went wrong. Please try again.';
};
