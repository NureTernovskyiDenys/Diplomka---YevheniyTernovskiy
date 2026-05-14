import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface LoaderProps {
    label?: string;
    size?: 'small' | 'large';
    fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ label, size = 'large', fullScreen }) => {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size={size} color={colors.accent.cyan} />
            {label ? <Text style={styles.label}>{label}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    label: {
        ...typography.small,
        color: colors.accent.cyanLight,
        fontWeight: '600',
    },
});
