import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg.base },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}