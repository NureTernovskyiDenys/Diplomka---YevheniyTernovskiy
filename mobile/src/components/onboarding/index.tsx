import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface ProgressBarProps {
    progress: number; // 0..1
}
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const width = useRef(new Animated.Value(progress)).current;
    useEffect(() => {
        Animated.timing(width, {
            toValue: progress,
            duration: 320,
            useNativeDriver: false,
        }).start();
    }, [progress]);
    return (
        <View style={styles.progressTrack}>
            <Animated.View
                style={[
                    styles.progressFill,
                    { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
            />
        </View>
    );
};

interface StepHeaderProps {
    title: string;
    subtitle?: string;
}
export const StepHeader: React.FC<StepHeaderProps> = ({ title, subtitle }) => (
    <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
);

interface SelectCardProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    selected: boolean;
    onPress: () => void;
    style?: ViewStyle;
}
export const SelectCard: React.FC<SelectCardProps> = ({ title, description, icon, selected, onPress, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, bounciness: 0 }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 0 }).start();
    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.selectCard, selected && styles.selectCardSelected, style]}
            >
                {icon ? (
                    <View style={[styles.selectIcon, selected && styles.selectIconSelected]}>{icon}</View>
                ) : null}
                <View style={{ flex: 1 }}>
                    <Text style={styles.selectTitle}>{title}</Text>
                    {description ? <Text style={styles.selectDesc}>{description}</Text> : null}
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                </View>
            </Pressable>
        </Animated.View>
    );
};

interface ChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
}
export const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.chip,
            selected && styles.chipSelected,
            pressed && { opacity: 0.85 },
        ]}
    >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    progressTrack: {
        height: 4,
        backgroundColor: colors.border.muted,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.accent.cyan,
        borderRadius: radius.pill,
    },
    headerWrap: { marginBottom: spacing.xl2 },
    headerTitle: {
        ...typography.h1,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.text.muted,
    },
    selectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.bg.surface,
        borderColor: colors.border.default,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    selectCardSelected: {
        borderColor: colors.accent.cyan,
        backgroundColor: colors.accent.cyanSoft,
    },
    selectIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.bg.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectIconSelected: {
        backgroundColor: colors.accent.cyan,
    },
    selectTitle: {
        ...typography.bodyBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    selectDesc: {
        ...typography.small,
        color: colors.text.muted,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border.strong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.accent.cyan,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.accent.cyan,
    },
    chip: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    chipSelected: {
        backgroundColor: colors.accent.cyan,
        borderColor: colors.accent.cyan,
    },
    chipText: {
        ...typography.bodyBold,
        color: colors.text.muted,
    },
    chipTextSelected: {
        color: colors.bg.base,
    },
});