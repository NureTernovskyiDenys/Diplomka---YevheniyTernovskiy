import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
    return (
        <View style={styles.container}>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {action ? <View style={styles.action}>{action}</View> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: spacing.xl3,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        marginVertical: spacing.lg,
    },
    icon: {
        marginBottom: spacing.lg,
        opacity: 0.6,
    },
    title: {
        ...typography.h3,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.body,
        color: colors.text.faint,
        textAlign: 'center',
        maxWidth: 280,
    },
    action: {
        marginTop: spacing.xl,
    },
});
