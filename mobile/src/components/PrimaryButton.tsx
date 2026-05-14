import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    fullWidth = true,
    style,
}) => {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                styles[`size_${size}`],
                styles[`variant_${variant}`],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
                style,
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color={textColorFor(variant)} />
                ) : (
                    <>
                        {icon ? <View style={styles.icon}>{icon}</View> : null}
                        <Text style={[styles.label, { color: textColorFor(variant) }, styles[`labelSize_${size}`]]}>
                            {label}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
};

const textColorFor = (v: Variant) => {
    switch (v) {
        case 'primary': return colors.bg.base;
        case 'secondary': return colors.text.primary;
        case 'ghost': return colors.text.muted;
        case 'danger': return '#ffffff';
        case 'success': return '#ffffff';
    }
};

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    fullWidth: {
        alignSelf: 'stretch',
    },
    size_sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    size_md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    size_lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl2,
    },
    variant_primary: {
        backgroundColor: colors.accent.cyan,
        shadowColor: colors.accent.cyan,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    variant_secondary: {
        backgroundColor: colors.bg.surface,
        borderColor: colors.border.default,
    },
    variant_ghost: {
        backgroundColor: 'transparent',
    },
    variant_danger: {
        backgroundColor: colors.danger.base,
    },
    variant_success: {
        backgroundColor: colors.emerald.base,
    },
    disabled: {
        opacity: 0.45,
    },
    pressed: {
        transform: [{ scale: 0.97 }],
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    icon: {
        marginRight: 0,
    },
    label: {
        ...typography.bodyBold,
        fontWeight: '700',
    },
    labelSize_sm: {
        fontSize: 13,
    },
    labelSize_md: {
        fontSize: 15,
    },
    labelSize_lg: {
        fontSize: 16,
    },
});
