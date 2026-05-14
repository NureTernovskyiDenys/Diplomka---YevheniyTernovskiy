import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function BlogLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg.base },
                animation: 'slide_from_right',
            }}
        />
    );
}
