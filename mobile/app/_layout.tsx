import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiRegistry } from '../src/services';
import { API_BASE_URL, USE_MOCK } from '../src/config';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { Loader } from '../src/components';
import { colors } from '../src/theme';

ApiRegistry.configure(API_BASE_URL, { useMock: USE_MOCK });
if (USE_MOCK) console.log('[GymAnalysis] Mock backend ENABLED — data persists locally only.');

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initializing, isAuthenticated, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (initializing) return;
        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboardingGroup = segments[0] === '(onboarding)';
        const needsOnboarding = isAuthenticated && !user?.profile?.onboardingComplete;

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (needsOnboarding && !inOnboardingGroup) {
            router.replace('/(onboarding)');
        } else if (isAuthenticated && !needsOnboarding && !inAppGroup) {
            router.replace('/(app)/dashboard');
        }
    }, [initializing, isAuthenticated, segments, router, user]);

    if (initializing) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
                <Loader fullScreen label="Initializing" />
            </View>
        );
    }
    return <>{children}</>;
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AuthGate>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: colors.bg.base },
                            animation: 'fade',
                        }}
                    >
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(app)" />
                    </Stack>
                </AuthGate>
            </AuthProvider>
        </SafeAreaProvider>
    );
}