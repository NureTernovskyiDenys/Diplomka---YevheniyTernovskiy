import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Dumbbell, TrendingUp, BookOpen, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';

export default function AppLayout() {
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom > 0 ? insets.bottom : Platform.OS === 'android' ? 12 : 0;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.bg.surface,
                    borderTopColor: colors.border.muted,
                    borderTopWidth: 1,
                    height: 88 + bottomInset,
                    paddingTop: 10,
                    paddingBottom: 12 + bottomInset,
                },
                tabBarActiveTintColor: colors.accent.cyanLight,
                tabBarInactiveTintColor: colors.text.faint,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.4,
                    lineHeight: 14,
                    marginTop: 4,
                    marginBottom: 0,
                    paddingBottom: 0,
                    includeFontPadding: false,
                },
                tabBarIconStyle: {
                    marginTop: 0,
                },
                sceneStyle: { backgroundColor: colors.bg.base },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Hub',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 2} />,
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: 'Workouts',
                    tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size - 2} />,
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size - 2} />,
                }}
            />
            <Tabs.Screen
                name="blog"
                options={{
                    title: 'Blog',
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size - 2} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
                }}
            />
            <Tabs.Screen
                name="payment-result"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen name="exercises" options={{ href: null }} />
            <Tabs.Screen name="tools" options={{ href: null }} />
            <Tabs.Screen name="subscriptions" options={{ href: null }} />
            <Tabs.Screen name="history" options={{ href: null }} />
        </Tabs>
    );
}