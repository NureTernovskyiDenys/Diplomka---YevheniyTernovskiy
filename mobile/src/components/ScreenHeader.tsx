import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    accent?: 'cyan' | 'indigo' | 'rose' | 'emerald' | 'amber';
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    showBack,
    rightAction,
    accent,
}) => {
    const router = useRouter();
    const accentColor =
        accent === 'cyan' ? colors.accent.cyanLight :
            accent === 'indigo' ? colors.indigo.light :
                accent === 'rose' ? colors.rose.light :
                    accent === 'emerald' ? colors.emerald.light :
                        accent === 'amber' ? colors.amber.light :
                            null;

    return (
        <View style={styles.wrap}>
            {showBack ? (
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
                >
                    <ChevronLeft color={colors.text.muted} size={20} />
                    <Text style={styles.backLabel}>Back</Text>
                </Pressable>
            ) : null}
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, accentColor ? { color: accentColor } : null]}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                {rightAction ? <View>{rightAction}</View> : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        marginBottom: spacing.xl,
    },
    back: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.md,
        alignSelf: 'flex-start',
    },
    backLabel: {
        ...typography.small,
        color: colors.text.muted,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    title: {
        ...typography.display,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.faint,
        marginTop: spacing.xs,
    },
});