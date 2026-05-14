import { HttpClient } from './HttpClient';
import { AuthService } from './AuthService';
import { UsersService } from './UsersService';
import { WorkoutsService } from './WorkoutsService';
import { ExercisesService } from './ExercisesService';
import { BlogService } from './BlogService';
import { SubscriptionsService } from './SubscriptionsService';
import { AnalyticsService } from './AnalyticsService';
import { WorkoutSessionsService } from './WorkoutSessionsService';

export { HttpClient, formatError } from './HttpClient';
export { AuthService } from './AuthService';
export { UsersService } from './UsersService';
export { WorkoutsService } from './WorkoutsService';
export { ExercisesService } from './ExercisesService';
export { BlogService } from './BlogService';
export { SubscriptionsService } from './SubscriptionsService';
export { AnalyticsService } from './AnalyticsService';
export { WorkoutSessionsService } from './WorkoutSessionsService';

/**
 * ApiRegistry — single composition root that wires every microservice client
 * around a shared HttpClient. Screens consume the registry instead of new'ing
 * services themselves so swapping the transport stays a one-line change.
 */
export class ApiRegistry {
    public readonly http: HttpClient;
    public readonly auth: AuthService;
    public readonly users: UsersService;
    public readonly workouts: WorkoutsService;
    public readonly exercises: ExercisesService;
    public readonly blog: BlogService;
    public readonly subscriptions: SubscriptionsService;
    public readonly analytics: AnalyticsService;
    public readonly workoutSessions: WorkoutSessionsService;

    private constructor(http: HttpClient) {
        this.http = http;
        this.auth = new AuthService(http);
        this.users = new UsersService(http);
        this.workouts = new WorkoutsService(http);
        this.exercises = new ExercisesService(http);
        this.blog = new BlogService(http);
        this.subscriptions = new SubscriptionsService(http);
        this.analytics = new AnalyticsService(http);
        this.workoutSessions = new WorkoutSessionsService(http);
    }

    private static _instance: ApiRegistry | null = null;

    static configure(baseURL: string, options: { useMock?: boolean } = {}): ApiRegistry {
        let adapter: import('axios').AxiosAdapter | undefined;
        if (options.useMock) {
            // Lazy import so the mock module never lands in production bundles
            // when the flag is off.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { MockApiServer } = require('./mock/MockApiServer');
            adapter = new MockApiServer().asAxiosAdapter();
        }
        const http = HttpClient.configure(baseURL, { adapter });
        if (!ApiRegistry._instance) {
            ApiRegistry._instance = new ApiRegistry(http);
        }
        return ApiRegistry._instance;
    }

    static get instance(): ApiRegistry {
        if (!ApiRegistry._instance) {
            throw new Error('ApiRegistry not configured. Call ApiRegistry.configure(baseURL) at app boot.');
        }
        return ApiRegistry._instance;
    }
}