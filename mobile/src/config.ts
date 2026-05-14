import Constants from 'expo-constants';

const extra = (Constants?.expoConfig?.extra as any) ?? {};

/**
 * Base URL of the NestJS backend. Override via EXPO_PUBLIC_API_URL or via
 * `extra.apiUrl` in app.json. When useMock is true the URL is meaningless —
 * the in-app mock adapter intercepts every request anyway.
 */
const fallback = 'http://localhost:3000/api/nest';
export const API_BASE_URL: string =
    process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || fallback;

/**
 * When true, the app talks to the in-app mock backend (services/mock/...)
 * instead of the network. Persists users + workouts in SecureStore/localStorage,
 * serves static fixtures for exercises / blog / plans. Toggle via
 * `extra.useMock` in app.json or EXPO_PUBLIC_USE_MOCK=1.
 */
export const USE_MOCK: boolean =
    process.env.EXPO_PUBLIC_USE_MOCK === '1' ||
    process.env.EXPO_PUBLIC_USE_MOCK === 'true' ||
    extra.useMock === true ||
    // Default ON until a real backend is provisioned.
    extra.useMock === undefined;
