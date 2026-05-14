import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';

interface BackButtonProps {
    label?: string;
    onPress?: () => void;
    iconOnly?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const BackButton: React.FC<BackButtonProps> = ({
    label = 'Back',
    onPress,
    iconOnly = false,
    style,
}) => {
    const router = useRouter();
    const handlePress = onPress ?? (() => router.back());

    return (
        <Pressable
            onPress={handlePress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
                iconOnly ? styles.iconOnly : styles.pill,
                pressed && styles.pressed,
                style,
            ]}
        >
            <ChevronLeft
                color={colors.text.primary}
                size={iconOnly ? 22 : 18}
                strokeWidth={2.5}
            />
            {!iconOnly && <Text style={styles.label}>{label}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingLeft: spacing.sm + 2,
        paddingRight: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.strong,
        borderRadius: radius.pill,
        marginBottom: spacing.lg,
    },
    iconOnly: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.strong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: {
        backgroundColor: colors.bg.surfaceAlt,
        borderColor: colors.accent.cyan,
    },
    label: {
        ...typography.bodyBold,
        fontSize: 14,
        color: colors.text.primary,
    },
});
