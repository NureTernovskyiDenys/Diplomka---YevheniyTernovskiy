import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';

interface ToastProps {
    message: string;
    tone?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, tone = 'info' }) => {
    const config = {
        success: { color: colors.emerald.light, bg: colors.emerald.soft, border: 'rgba(16,185,129,0.3)', icon: <CheckCircle2 color={colors.emerald.light} size={18} /> },
        error: { color: colors.danger.light, bg: colors.danger.soft, border: 'rgba(239,68,68,0.3)', icon: <AlertTriangle color={colors.danger.light} size={18} /> },
        info: { color: colors.accent.cyanLight, bg: colors.accent.cyanSoft, border: 'rgba(34,211,238,0.3)', icon: <Info color={colors.accent.cyanLight} size={18} /> },
    }[tone];

    return (
        <View style={[styles.wrap, { backgroundColor: config.bg, borderColor: config.border }]}>
            {config.icon}
            <Text style={[styles.text, { color: config.color }]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    text: {
        ...typography.small,
        flex: 1,
        fontWeight: '600',
    },
});
