import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'default' | 'elevated' | 'outline' | 'glow';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    variant?: Variant;
    accent?: 'cyan' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'none';
    padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    onPress,
    style,
    variant = 'default',
    accent = 'none',
    padded = true,
}) => {
    const accentBorder =
        accent === 'cyan' ? colors.accent.cyan
            : accent === 'indigo' ? colors.indigo.base
                : accent === 'rose' ? colors.rose.base
                    : accent === 'emerald' ? colors.emerald.base
                        : accent === 'amber' ? colors.amber.base
                            : null;

    const cardStyle: StyleProp<ViewStyle> = [
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outline' && styles.outline,
        variant === 'glow' && styles.glow,
        accentBorder ? { borderColor: accentBorder } : null,
        padded && styles.padded,
        style,
    ];

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                android_ripple={{ color: colors.bg.surfaceAlt }}
                style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
            >
                {children}
            </Pressable>
        );
    }
    return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.bg.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    padded: {
        padding: spacing.xl,
    },
    elevated: {
        backgroundColor: colors.bg.elevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
        elevation: 8,
    },
    outline: {
        backgroundColor: 'transparent',
    },
    glow: {
        backgroundColor: colors.bg.surface,
        borderColor: colors.accent.cyan,
        shadowColor: colors.accent.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },
});
