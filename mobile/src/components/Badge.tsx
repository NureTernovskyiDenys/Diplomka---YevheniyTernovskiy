import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Tone = 'cyan' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'neutral' | 'danger';

interface BadgeProps {
    label: string;
    tone?: Tone;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const palette = {
    cyan: { bg: colors.accent.cyanSoft, text: colors.accent.cyanLight, border: 'rgba(6,182,212,0.3)' },
    indigo: { bg: colors.indigo.soft, text: colors.indigo.light, border: 'rgba(99,102,241,0.3)' },
    rose: { bg: colors.rose.soft, text: colors.rose.light, border: 'rgba(244,63,94,0.3)' },
    emerald: { bg: colors.emerald.soft, text: colors.emerald.light, border: 'rgba(16,185,129,0.3)' },
    amber: { bg: colors.amber.soft, text: colors.amber.light, border: 'rgba(245,158,11,0.3)' },
    neutral: { bg: colors.bg.surfaceAlt, text: colors.text.muted, border: colors.border.default },
    danger: { bg: colors.danger.soft, text: colors.danger.light, border: 'rgba(239,68,68,0.3)' },
};

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral', icon, style }) => {
    const p = palette[tone];
    return (
        <View style={[styles.base, { backgroundColor: p.bg, borderColor: p.border }, style]}>
            {icon ? <View style={{ marginRight: spacing.xs }}>{icon}</View> : null}
            <Text style={[styles.text, { color: p.text }]} numberOfLines={1}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.sm,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    text: {
        ...typography.micro,
        fontSize: 11,
        textTransform: 'capitalize',
    },
});
