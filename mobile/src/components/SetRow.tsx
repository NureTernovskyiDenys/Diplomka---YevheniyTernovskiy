import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { Check, Minus, Plus, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';

interface SetRowProps {
    index: number;
    weight: string;
    reps: string;
    completed: boolean;
    placeholder?: { weight: number; reps: number } | null;
    onChangeWeight: (v: string) => void;
    onChangeReps: (v: string) => void;
    onComplete: () => void;
    onDelete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
    index, weight, reps, completed, placeholder, onChangeWeight, onChangeReps, onComplete, onDelete,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const bump = (fn: () => void) => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.97, duration: 60, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
        ]).start();
        fn();
    };

    const stepWeight = (delta: number) => {
        const cur = parseFloat(weight) || placeholder?.weight || 0;
        const next = Math.max(0, cur + delta);
        onChangeWeight(next % 1 === 0 ? String(next) : next.toFixed(1));
    };
    const stepReps = (delta: number) => {
        const cur = parseInt(reps) || placeholder?.reps || 0;
        onChangeReps(String(Math.max(0, cur + delta)));
    };

    const handleComplete = () => {
        if (completed) return;
        if (!weight && placeholder) onChangeWeight(String(placeholder.weight));
        if (!reps && placeholder) onChangeReps(String(placeholder.reps));
        bump(onComplete);
    };

    return (
        <Animated.View style={[styles.row, completed && styles.rowDone, { transform: [{ scale }] }]}>
            <View style={styles.headerRow}>
                <View style={styles.indexBubble}>
                    <Text style={styles.indexText}>{index}</Text>
                </View>
                <Text style={styles.setLabel}>Set</Text>
                <View style={{ flex: 1 }} />
                <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBtn}>
                    <Trash2 color={colors.text.veryFaint} size={16} />
                </Pressable>
            </View>

            <View style={styles.fieldsRow}>
                <Field
                    label="Weight (kg)"
                    value={weight}
                    placeholder={placeholder ? String(placeholder.weight) : '0'}
                    onChange={onChangeWeight}
                    onMinus={() => bump(() => stepWeight(-2.5))}
                    onPlus={() => bump(() => stepWeight(2.5))}
                    keyboardType="decimal-pad"
                    disabled={completed}
                />
                <Field
                    label="Reps"
                    value={reps}
                    placeholder={placeholder ? String(placeholder.reps) : '0'}
                    onChange={onChangeReps}
                    onMinus={() => bump(() => stepReps(-1))}
                    onPlus={() => bump(() => stepReps(1))}
                    keyboardType="number-pad"
                    disabled={completed}
                />
            </View>

            <Pressable
                onPress={handleComplete}
                style={[styles.checkBtn, completed && styles.checkBtnDone]}
            >
                <Check color={completed ? colors.bg.base : colors.text.muted} size={18} strokeWidth={3} />
                <Text style={[styles.checkLabel, completed && styles.checkLabelDone]}>
                    {completed ? 'Logged' : 'Mark set done'}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

interface FieldProps {
    label: string;
    value: string;
    placeholder: string;
    onChange: (v: string) => void;
    onMinus: () => void;
    onPlus: () => void;
    keyboardType: 'number-pad' | 'decimal-pad';
    disabled?: boolean;
}
const Field: React.FC<FieldProps> = ({ label, value, placeholder, onChange, onMinus, onPlus, keyboardType, disabled }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldRow}>
            <Pressable
                style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed, disabled && styles.stepBtnDisabled]}
                onPress={onMinus}
                disabled={disabled}
                hitSlop={6}
            >
                <Minus color={disabled ? colors.text.veryFaint : colors.text.primary} size={20} strokeWidth={3} />
            </Pressable>

            <View style={styles.valueBox}>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.veryFaint}
                    keyboardType={keyboardType}
                    style={styles.input}
                    editable={!disabled}
                    selectTextOnFocus
                />
            </View>

            <Pressable
                style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed, disabled && styles.stepBtnDisabled]}
                onPress={onPlus}
                disabled={disabled}
                hitSlop={6}
            >
                <Plus color={disabled ? colors.text.veryFaint : colors.text.primary} size={20} strokeWidth={3} />
            </Pressable>
        </View>
    </View>
);

const styles = StyleSheet.create({
    row: {
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    rowDone: {
        borderColor: colors.emerald.base,
        backgroundColor: colors.emerald.soft,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    indexBubble: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: colors.bg.muted,
        alignItems: 'center', justifyContent: 'center',
    },
    indexText: { ...typography.small, color: colors.text.muted, fontWeight: '700', fontSize: 11 },
    setLabel: { ...typography.small, color: colors.text.muted, fontWeight: '600' },
    deleteBtn: { padding: spacing.xs },
    fieldsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    fieldWrap: { flex: 1 },
    fieldLabel: {
        ...typography.small,
        color: colors.text.faint,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    stepBtn: {
        width: 44,
        height: 48,
        borderRadius: radius.sm,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBtnPressed: {
        backgroundColor: colors.accent.cyanSoft,
        borderColor: colors.accent.cyan,
    },
    stepBtnDisabled: {
        opacity: 0.4,
    },
    valueBox: {
        flex: 1,
        height: 48,
        borderRadius: radius.sm,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        width: '100%',
        textAlign: 'center',
        color: colors.text.primary,
        ...typography.bodyBold,
        fontSize: 18,
        padding: 0,
    },
    checkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 48,
        borderRadius: radius.sm,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    checkBtnDone: {
        backgroundColor: colors.emerald.base,
        borderColor: colors.emerald.base,
    },
    checkLabel: {
        ...typography.bodyBold,
        color: colors.text.muted,
        fontSize: 14,
    },
    checkLabelDone: {
        color: colors.bg.base,
    },
});