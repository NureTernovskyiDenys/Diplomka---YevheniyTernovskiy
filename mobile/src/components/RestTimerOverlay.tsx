import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Vibration } from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
    seconds: number;
    onSkip: () => void;
}

export const RestTimerOverlay: React.FC<Props> = ({ seconds, onSkip }) => {
    const [remaining, setRemaining] = useState(seconds);
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        setRemaining(seconds);
    }, [seconds]);

    useEffect(() => {
        if (remaining <= 0) {
            Vibration.vibrate(400);
            onSkip();
            return;
        }
        const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
        return () => clearTimeout(t);
    }, [remaining]);

    const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
    const ss = (remaining % 60).toString().padStart(2, '0');

    return (
        <Animated.View style={[styles.wrap, { opacity }]}>
            <Pressable onPress={() => setRemaining((r) => Math.max(0, r - 15))} style={styles.adjust}>
                <Minus color={colors.text.primary} size={18} />
                <Text style={styles.adjustLabel}>15s</Text>
            </Pressable>
            <View style={styles.center}>
                <Text style={styles.label}>REST</Text>
                <Text style={styles.time}>{mm}:{ss}</Text>
            </View>
            <Pressable onPress={() => setRemaining((r) => r + 15)} style={styles.adjust}>
                <Plus color={colors.text.primary} size={18} />
                <Text style={styles.adjustLabel}>15s</Text>
            </Pressable>
            <Pressable onPress={onSkip} style={styles.skip} hitSlop={8}>
                <X color={colors.text.muted} size={18} />
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.accent.cyanSoft,
        borderColor: colors.accent.cyan,
        borderWidth: 1,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    adjust: { alignItems: 'center', paddingHorizontal: spacing.sm },
    adjustLabel: { ...typography.small, color: colors.text.muted, fontSize: 10, marginTop: 2 },
    center: { flex: 1, alignItems: 'center' },
    label: { ...typography.label, color: colors.accent.cyanLight, fontSize: 10 },
    time: { ...typography.h2, color: colors.text.primary, fontVariant: ['tabular-nums'] },
    skip: { padding: spacing.sm },
});