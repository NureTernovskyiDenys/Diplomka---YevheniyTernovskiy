import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, action }) => {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {icon ? <View style={styles.icon}>{icon}</View> : null}
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            {action ? <View>{action}</View> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.h2,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
    },
});
