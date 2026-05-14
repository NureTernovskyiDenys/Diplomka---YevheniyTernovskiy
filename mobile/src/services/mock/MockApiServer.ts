import { AxiosAdapter, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SecureStorage } from '../SecureStorage';
import { issueMockJwt } from './jwt';
import {
    EXERCISE_FIXTURES, BLOG_FIXTURES, PLAN_FIXTURES,
    FixtureExercise, FixtureBlog, FixturePlan,
} from './fixtures';

interface MockSetLog { weight: number; reps: number; completedAt: string; rpe?: number; }
interface MockExerciseLog { exerciseId: string; sets: MockSetLog[]; }
interface MockWorkoutSession {
    _id: string;
    workoutId: string;
    userId: string;
    startedAt: string;
    finishedAt?: string;
    durationSec?: number;
    exercises: MockExerciseLog[];
}

interface MockUser {
    _id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    profile: Record<string, any>;
    subscription: { planId?: string; active: boolean; expiresAt?: string };
    createdAt: string;
    updatedAt: string;
}

interface MockWorkoutExercise {
    _id: string;
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
}

interface MockWorkout {
    _id: string;
    name: string;
    user: string;
    exercises: MockWorkoutExercise[];
    createdAt: string;
    updatedAt: string;
}

interface DbShape {
    users: MockUser[];
    workouts: MockWorkout[];
    workoutSessions: MockWorkoutSession[];
}

const STORAGE_KEY = 'mock_api_db_v1';

const newId = (prefix: string) =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const cheapHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
    return `mock$${h}`;
};

const stripPassword = ({ passwordHash, ...rest }: MockUser) => rest;

interface MockResponse<T = any> {
    status: number;
    data: T;
}

/**
 * In-app fake REST backend. Uses persistent storage for users + workouts and
 * static fixtures for exercises / blog / subscriptions. Exposed as an axios
 * adapter so the rest of the codebase keeps speaking HTTP.
 */
export class MockApiServer {
    private db: DbShape = { users: [], workouts: [], workoutSessions: [] };
    private hydrated = false;
    private currentUserId: string | null = null;

    private async hydrate() {
        if (this.hydrated) return;
        try {
            const raw = await SecureStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.users && parsed?.workouts) {
                    this.db = {
                        users: parsed.users,
                        workouts: parsed.workouts,
                        // Backwards-compatible: older saved DBs don't have this field.
                        workoutSessions: parsed.workoutSessions ?? [],
                    };
                }
            }
        } catch {
            // ignore — start fresh
        }
        this.hydrated = true;
    }

    private async persist() {
        try {
            await SecureStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
        } catch {
            // best-effort
        }
    }

    private decodeBearer(authHeader?: string): string | null {
        if (!authHeader?.startsWith('Bearer ')) return null;
        const token = authHeader.slice(7);
        const parts = token.split('.');
        if (parts.length < 2) return null;
        try {
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
            const json = typeof globalThis.atob === 'function'
                ? globalThis.atob(padded)
                : (globalThis as any).Buffer.from(padded, 'base64').toString('utf-8');
            const obj = JSON.parse(json);
            if (obj.exp && obj.exp * 1000 < Date.now()) return null;
            return obj.sub ?? null;
        } catch {
            return null;
        }
    }

    asAxiosAdapter(): AxiosAdapter {
        return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
            await this.hydrate();
            // simulate a tiny network delay so spinners are visible
            await new Promise((r) => setTimeout(r, 180));

            const method = (config.method ?? 'get').toUpperCase();
            const url = (config.url ?? '');
            const path = url.split('?')[0];
            const body = parseBody(config.data);
            const params = (config.params ?? {}) as Record<string, any>;
            const auth = (config.headers?.Authorization ?? config.headers?.authorization) as string | undefined;
            this.currentUserId = this.decodeBearer(auth);

            try {
                const result = await this.dispatch(method, path, body, params);
                return makeResponse(config, result);
            } catch (e: any) {
                const status = e?.status ?? 500;
                const message = e?.message ?? 'Mock server error';
                throw makeError(config, { status, data: { message, statusCode: status } });
            }
        };
    }

    private async dispatch(method: string, path: string, body: any, params: any): Promise<MockResponse> {
        // === auth
        if (method === 'POST' && path === '/auth/register') return this.handleRegister(body);
        if (method === 'POST' && path === '/auth/login') return this.handleLogin(body);

        // === users
        let m = path.match(/^\/users\/([^/]+)$/);
        if (m) {
            this.requireAuth();
            if (method === 'GET') return this.handleGetUser(m[1]);
            if (method === 'PUT') return this.handleUpdateUser(m[1], body);
        }

        // === workouts
        if (path === '/workouts' && method === 'GET') {
            this.requireAuth();
            return this.handleListWorkouts(params);
        }
        if (path === '/workouts' && method === 'POST') {
            this.requireAuth();
            return this.handleCreateWorkout(body);
        }
        m = path.match(/^\/workouts\/([^/]+)$/);
        if (m) {
            this.requireAuth();
            if (method === 'GET') return this.handleGetWorkout(m[1]);
            if (method === 'PUT') return this.handleRenameWorkout(m[1], body);
            if (method === 'DELETE') return this.handleDeleteWorkout(m[1]);
        }
        m = path.match(/^\/workouts\/([^/]+)\/exercises$/);
        if (m && method === 'POST') {
            this.requireAuth();
            return this.handleAddExercise(m[1], body);
        }
        m = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)$/);
        if (m && method === 'PUT') {
            this.requireAuth();
            return this.handleUpdateExercise(m[1], m[2], body);
        }
        if (m && method === 'DELETE') {
            this.requireAuth();
            return this.handleRemoveExercise(m[1], m[2]);
        }
        m = path.match(/^\/workouts\/([^/]+)\/recommendation$/);
        if (m && method === 'GET') {
            this.requireAuth();
            return this.handleRecommendation(m[1]);
        }

        // === workout sessions (logged sets per workout)
        if (path === '/workout-sessions' && method === 'GET') {
            this.requireAuth();
            return this.handleListSessions(params);
        }
        if (path === '/workout-sessions' && method === 'POST') {
            this.requireAuth();
            return this.handleCreateSession(body);
        }

        // === exercises (read-only fixtures)
        if (path === '/exercises' && method === 'GET') return this.handleExerciseList(params);
        if (path === '/exercises/search' && method === 'GET') return this.handleExerciseSearch(params);
        m = path.match(/^\/exercises\/([^/]+)$/);
        if (m && method === 'GET') return this.handleExerciseById(m[1]);

        // === blog
        if (path === '/blog' && method === 'GET') return { status: 200, data: BLOG_FIXTURES };
        m = path.match(/^\/blog\/([^/]+)$/);
        if (m && method === 'GET') {
            const post = BLOG_FIXTURES.find((b) => b.id === m![1]);
            if (!post) throw notFound('Blog post not found');
            return { status: 200, data: post };
        }

        // === subscriptions
        if (path === '/subscriptions' && method === 'GET') return { status: 200, data: PLAN_FIXTURES };
        m = path.match(/^\/subscriptions\/([^/]+)\/subscribe$/);
        if (m && method === 'POST') {
            this.requireAuth();
            return this.handleSubscribe(m[1]);
        }

        throw notFound(`Mock route not implemented: ${method} ${path}`);
    }

    // ===== handlers ======

    private async handleRegister(body: any): Promise<MockResponse> {
        const { email, password, firstName, lastName } = body ?? {};
        if (!email || !password) throw httpError(400, 'Email and password are required.');
        if (this.db.users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
            throw httpError(409, 'An account with this email already exists.');
        }
        const now = new Date().toISOString();
        const user: MockUser = {
            _id: newId('user'),
            email,
            passwordHash: cheapHash(password),
            firstName: firstName ?? '',
            lastName: lastName ?? '',
            role: 'user',
            profile: {},
            subscription: { active: false },
            createdAt: now,
            updatedAt: now,
        };
        this.db.users.push(user);
        await this.persist();
        return { status: 201, data: stripPassword(user) };
    }

    private async handleLogin(body: any): Promise<MockResponse> {
        const { email, password } = body ?? {};
        const user = this.db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
        if (!user || user.passwordHash !== cheapHash(password ?? '')) {
            throw httpError(401, 'Invalid email or password.');
        }
        const token = issueMockJwt({ sub: user._id, email: user.email, role: user.role });
        return { status: 200, data: { access_token: token } };
    }

    private handleGetUser(id: string): MockResponse {
        const user = this.db.users.find((u) => u._id === id);
        if (!user) throw notFound('User not found');
        if (this.currentUserId !== id && this.findCurrentUser()?.role !== 'admin') {
            throw httpError(403, 'Unauthorized access');
        }
        return { status: 200, data: stripPassword(user) };
    }

    private async handleUpdateUser(id: string, body: any): Promise<MockResponse> {
        const idx = this.db.users.findIndex((u) => u._id === id);
        if (idx === -1) throw notFound('User not found');
        if (this.currentUserId !== id && this.findCurrentUser()?.role !== 'admin') {
            throw httpError(403, 'Unauthorized access');
        }
        const existing = this.db.users[idx];
        const next: MockUser = {
            ...existing,
            firstName: body?.firstName ?? existing.firstName,
            lastName: body?.lastName ?? existing.lastName,
            profile: body?.profile ? { ...existing.profile, ...body.profile } : existing.profile,
            subscription: body?.subscription ?? existing.subscription,
            updatedAt: new Date().toISOString(),
        };
        this.db.users[idx] = next;
        await this.persist();
        return { status: 200, data: stripPassword(next) };
    }

    private handleListWorkouts(params: any): MockResponse {
        const search = (params?.search ?? '').toString().toLowerCase();
        const author = params?.author?.toString();
        let list = this.db.workouts;
        if (search || author) {
            list = list.filter((w) => {
                if (author && w.user !== author) return false;
                if (search && !w.name.toLowerCase().includes(search)) return false;
                return true;
            });
        } else {
            // Without filters return only the calling user's workouts (mirrors NestJS controller)
            list = list.filter((w) => w.user === this.currentUserId);
        }
        // Populate user ref shape expected by Workout.fromJson
        const populated = list.map((w) => {
            const u = this.db.users.find((x) => x._id === w.user);
            return {
                ...w,
                user: u
                    ? { _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email }
                    : w.user,
            };
        });
        return { status: 200, data: populated };
    }

    private async handleCreateWorkout(body: any): Promise<MockResponse> {
        if (!body?.name) throw httpError(400, 'Workout name is required.');
        const now = new Date().toISOString();
        const w: MockWorkout = {
            _id: newId('w'),
            name: body.name,
            user: this.currentUserId!,
            exercises: (body.exercises ?? []).map((e: any) => ({
                _id: newId('we'),
                exerciseId: String(e.exerciseId),
                sets: e.sets ?? 3,
                reps: e.reps ?? 10,
                weight: e.weight ?? 0,
            })),
            createdAt: now,
            updatedAt: now,
        };
        this.db.workouts.push(w);
        await this.persist();
        return { status: 201, data: w };
    }

    private handleGetWorkout(id: string): MockResponse {
        const w = this.db.workouts.find((x) => x._id === id && x.user === this.currentUserId);
        if (!w) throw notFound('Workout not found');
        return { status: 200, data: w };
    }

    private async handleRenameWorkout(id: string, body: any): Promise<MockResponse> {
        const idx = this.db.workouts.findIndex((x) => x._id === id && x.user === this.currentUserId);
        if (idx === -1) throw notFound('Workout not found');
        if (body?.name) this.db.workouts[idx].name = body.name;
        this.db.workouts[idx].updatedAt = new Date().toISOString();
        await this.persist();
        return { status: 200, data: this.db.workouts[idx] };
    }

    private async handleDeleteWorkout(id: string): Promise<MockResponse> {
        const idx = this.db.workouts.findIndex((x) => x._id === id && x.user === this.currentUserId);
        if (idx === -1) throw notFound('Workout not found');
        const [removed] = this.db.workouts.splice(idx, 1);
        // Also delete sessions tied to this workout (ownership check redundant — list is filtered above)
        this.db.workoutSessions = this.db.workoutSessions.filter((s) => s.workoutId !== id);
        await this.persist();
        return { status: 200, data: removed };
    }

    private async handleAddExercise(workoutId: string, body: any): Promise<MockResponse> {
        const idx = this.db.workouts.findIndex((x) => x._id === workoutId && x.user === this.currentUserId);
        if (idx === -1) throw notFound('Workout not found');
        if (!body?.exerciseId) throw httpError(400, 'exerciseId is required.');
        const item: MockWorkoutExercise = {
            _id: newId('we'),
            exerciseId: String(body.exerciseId),
            sets: 3, reps: 10, weight: 0,
        };
        this.db.workouts[idx].exercises.push(item);
        this.db.workouts[idx].updatedAt = new Date().toISOString();
        await this.persist();
        return { status: 200, data: this.db.workouts[idx] };
    }

    private async handleUpdateExercise(workoutId: string, exerciseObjId: string, body: any): Promise<MockResponse> {
        const wIdx = this.db.workouts.findIndex((x) => x._id === workoutId && x.user === this.currentUserId);
        if (wIdx === -1) throw notFound('Workout not found');
        const w = this.db.workouts[wIdx];
        const eIdx = w.exercises.findIndex((e) => e._id === exerciseObjId);
        if (eIdx === -1) throw notFound('Exercise not found');
        if (body?.sets !== undefined) w.exercises[eIdx].sets = Number(body.sets);
        if (body?.reps !== undefined) w.exercises[eIdx].reps = Number(body.reps);
        if (body?.weight !== undefined) w.exercises[eIdx].weight = Number(body.weight);
        w.updatedAt = new Date().toISOString();
        await this.persist();
        return { status: 200, data: w };
    }

    private async handleRemoveExercise(workoutId: string, exerciseObjId: string): Promise<MockResponse> {
        const wIdx = this.db.workouts.findIndex((x) => x._id === workoutId && x.user === this.currentUserId);
        if (wIdx === -1) throw notFound('Workout not found');
        const w = this.db.workouts[wIdx];
        const eIdx = w.exercises.findIndex((e) => e._id === exerciseObjId);
        if (eIdx === -1) throw notFound('Exercise not found');
        w.exercises.splice(eIdx, 1);
        w.updatedAt = new Date().toISOString();
        await this.persist();
        return { status: 200, data: w };
    }

    private handleRecommendation(workoutId: string): MockResponse {
        const w = this.db.workouts.find((x) => x._id === workoutId && x.user === this.currentUserId);
        if (!w) throw notFound('Workout not found');
        const user = this.findCurrentUser();
        const illnesses = (user?.profile?.illnesses ?? '').toString().toLowerCase();
        const goals = (user?.profile?.fitnessGoals ?? '').toString().toLowerCase();

        const assessments = w.exercises.map((ex) => {
            const meta = EXERCISE_FIXTURES.find((f) => f.exerciseId === ex.exerciseId);
            const target = meta?.targetMuscles?.[0] ?? '';
            let status: 'Recommended' | 'Not Recommended' | 'Consult Doctor' | 'Neutral' = 'Recommended';
            let reason = `Hits ${target || 'muscle group'} effectively for your goal.`;

            if (illnesses.includes('back') && ['ex-002', 'ex-003', 'ex-006'].includes(ex.exerciseId)) {
                status = 'Not Recommended';
                reason = 'High spinal load — risky for users with reported lower-back issues.';
            } else if (illnesses.includes('shoulder') && ex.exerciseId === 'ex-004') {
                status = 'Consult Doctor';
                reason = 'Overhead pressing aggravates many shoulder pathologies.';
            } else if (goals.includes('lose') && ex.weight === 0) {
                status = 'Neutral';
                reason = 'Bodyweight option — supplement with a calorie deficit for fat loss.';
            }
            return { exerciseId: ex.exerciseId, status, reason };
        });

        const isSafe = !assessments.some((a) => a.status === 'Not Recommended');
        const warnings = assessments.filter((a) => a.status !== 'Recommended').map((a) => a.reason);
        const positives = [
            `${w.exercises.length} exercises selected with a clear primary movement.`,
            'Compound work present — strong stimulus per minute of training.',
        ];

        return {
            status: 200,
            data: {
                isSafe,
                warnings,
                positiveFeedback: positives,
                generalAdvice: illnesses
                    ? 'Watch for the flagged exercises and stop early if you feel pain. Otherwise this is a solid plan.'
                    : 'Routine looks balanced. Push hard on the compounds and recover well.',
                exerciseAssessments: assessments,
            },
        };
    }

    private handleListSessions(params: any): MockResponse {
        const workoutId = params?.workoutId?.toString();
        const userId = this.currentUserId;
        let list = this.db.workoutSessions.filter((s) => s.userId === userId);
        if (workoutId) list = list.filter((s) => s.workoutId === workoutId);
        // Newest first.
        list = [...list].sort((a, b) =>
            new Date(b.finishedAt ?? b.startedAt).getTime() -
            new Date(a.finishedAt ?? a.startedAt).getTime()
        );
        return { status: 200, data: list };
    }

    private async handleCreateSession(body: any): Promise<MockResponse> {
        if (!body?.workoutId) throw httpError(400, 'workoutId is required.');
        const owns = this.db.workouts.some(
            (w) => w._id === body.workoutId && w.user === this.currentUserId,
        );
        if (!owns) throw notFound('Workout not found');

        const session: MockWorkoutSession = {
            _id: newId('session'),
            workoutId: String(body.workoutId),
            userId: this.currentUserId!,
            startedAt: body.startedAt ?? new Date().toISOString(),
            finishedAt: body.finishedAt,
            durationSec: body.durationSec,
            exercises: Array.isArray(body.exercises) ? body.exercises : [],
        };
        this.db.workoutSessions.push(session);
        await this.persist();
        return { status: 201, data: session };
    }

    private handleExerciseList(params: any): MockResponse {
        const offset = Number(params?.offset ?? 0);
        const limit = Number(params?.limit ?? 30);
        const slice = EXERCISE_FIXTURES.slice(offset, offset + limit);
        return { status: 200, data: slice };
    }

    private handleExerciseSearch(params: any): MockResponse {
        const q = String(params?.q ?? '').toLowerCase().trim();
        const offset = Number(params?.offset ?? 0);
        const limit = Number(params?.limit ?? 30);
        const matches = EXERCISE_FIXTURES.filter((e) => {
            if (!q) return true;
            return e.name.toLowerCase().includes(q)
                || e.targetMuscles.some((m) => m.includes(q))
                || e.bodyParts.some((b) => b.includes(q))
                || e.equipments.some((eq) => eq.includes(q));
        });
        return { status: 200, data: matches.slice(offset, offset + limit) };
    }

    private handleExerciseById(id: string): MockResponse {
        const e = EXERCISE_FIXTURES.find((x) => x.exerciseId === id);
        if (!e) throw notFound('Exercise not found');
        return { status: 200, data: e };
    }

    private async handleSubscribe(planId: string): Promise<MockResponse> {
        const plan = PLAN_FIXTURES.find((p) => p._id === planId);
        if (!plan) throw notFound('Plan not found');
        const userIdx = this.db.users.findIndex((u) => u._id === this.currentUserId);
        if (userIdx === -1) throw notFound('User not found');
        const expiresAt = new Date(Date.now() + plan.durationInDays * 86400_000).toISOString();
        this.db.users[userIdx].subscription = {
            planId: plan._id,
            active: true,
            expiresAt,
        };
        this.db.users[userIdx].updatedAt = new Date().toISOString();
        await this.persist();
        return {
            status: 200,
            data: {
                message: `Successfully subscribed to ${plan.name}`,
                user: stripPassword(this.db.users[userIdx]),
            },
        };
    }

    private requireAuth(): void {
        if (!this.currentUserId || !this.findCurrentUser()) throw httpError(401, 'Authentication required.');
    }

    private findCurrentUser(): MockUser | undefined {
        if (!this.currentUserId) return undefined;
        return this.db.users.find((u) => u._id === this.currentUserId);
    }
}

// ===== helpers =====

const parseBody = (raw: any): any => {
    if (!raw) return undefined;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return raw; }
    }
    return raw;
};

const makeResponse = (config: InternalAxiosRequestConfig, result: MockResponse): AxiosResponse => ({
    data: result.data,
    status: result.status,
    statusText: result.status === 200 ? 'OK' : 'Done',
    headers: {} as any,
    config,
    request: {},
});

const makeError = (config: InternalAxiosRequestConfig, body: { status: number; data: any }): AxiosError => {
    const err = new AxiosError(
        body.data?.message ?? 'Request failed',
        String(body.status),
        config,
        {} as any,
        {
            data: body.data,
            status: body.status,
            statusText: 'Error',
            headers: {} as any,
            config,
        } as any,
    );
    return err;
};

const httpError = (status: number, message: string) => ({ status, message });
const notFound = (message: string) => httpError(404, message);