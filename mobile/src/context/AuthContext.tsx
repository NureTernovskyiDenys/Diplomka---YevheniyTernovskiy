import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { ApiRegistry, formatError } from '../services';
import { User } from '../models/User';

interface JwtPayload {
    sub: string;
    email: string;
    role?: 'user' | 'admin';
    exp?: number;
}

export interface AuthContextValue {
    user: User | null;
    userId: string | null;
    initializing: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const decodeJwt = (token: string): JwtPayload | null => {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return null;
    }
};

const isTokenAlive = (payload: JwtPayload | null): boolean => {
    if (!payload?.exp) return !!payload;
    return payload.exp * 1000 > Date.now();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);
    const api = ApiRegistry.instance;

    const handleUnauthorizedRef = useRef<() => void>(() => { });

    const clearAuth = useCallback(async () => {
        await api.http.clearToken();
        setUser(null);
        setUserId(null);
    }, [api]);

    handleUnauthorizedRef.current = clearAuth;

    useEffect(() => {
        const unsubscribe = api.http.onUnauthorized(() => handleUnauthorizedRef.current?.());
        return () => { unsubscribe(); };
    }, [api]);

    const hydrateUser = useCallback(async (id: string): Promise<User | null> => {
        try {
            const fresh = await api.users.getById(id);
            return fresh;
        } catch {
            return null;
        }
    }, [api]);

    const refreshUser = useCallback(async () => {
        if (!userId) return;
        const fresh = await hydrateUser(userId);
        if (fresh) setUser(fresh);
    }, [userId, hydrateUser]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const token = await api.http.getToken();
                const payload = token ? decodeJwt(token) : null;
                if (!payload || !isTokenAlive(payload)) {
                    await clearAuth();
                    return;
                }
                if (cancelled) return;
                setUserId(payload.sub);
                const fresh = await hydrateUser(payload.sub);
                if (cancelled) return;
                if (fresh) setUser(fresh);
                else {
                    // token decoded but profile fetch failed (e.g. offline) — keep token, surface a thin user
                    setUser(User.fromJson({
                        _id: payload.sub,
                        email: payload.email,
                        firstName: '',
                        lastName: '',
                        role: payload.role,
                    }));
                }
            } finally {
                if (!cancelled) setInitializing(false);
            }
        })();
        return () => { cancelled = true; };
    }, [api, clearAuth, hydrateUser]);

    const login: AuthContextValue['login'] = async (email, password) => {
        try {
            const { token } = await api.auth.login({ email, password });
            const payload = decodeJwt(token);
            if (!payload?.sub) {
                await clearAuth();
                return { success: false, error: 'Invalid token returned by server.' };
            }
            setUserId(payload.sub);
            const fresh = await hydrateUser(payload.sub);
            setUser(fresh ?? User.fromJson({ _id: payload.sub, email: payload.email, firstName: '', lastName: '', role: payload.role }));
            return { success: true };
        } catch (e) {
            return { success: false, error: formatError(e) };
        }
    };

    const register: AuthContextValue['register'] = async (firstName, lastName, email, password) => {
    try {
        await api.auth.register({ firstName, lastName, email, password });
        return await login(email, password);
    } catch (e) {
        return { success: false, error: formatError(e) };
    }
};

    const logout = useCallback(async () => {
        await clearAuth();
    }, [clearAuth]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        userId,
        initializing,
        isAuthenticated: !!user && !!userId,
        login,
        register,
        logout,
        refreshUser,
        setUser,
    }), [user, userId, initializing, refreshUser, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
