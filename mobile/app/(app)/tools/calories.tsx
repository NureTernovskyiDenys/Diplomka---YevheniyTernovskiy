import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Save, Flame, Calculator } from 'lucide-react-native';

import { Screen, Card, TextField, PrimaryButton, Toast, BackButton } from '../../../src/components';
import { ApiRegistry, formatError } from '../../../src/services';
import { useAuth } from '../../../src/context/AuthContext';
import { Gender } from '../../../src/models/User';
import { ActivityLevel, Goal, CalorieCalculator } from '../../../src/lib/fitness';
import { colors, spacing, typography, radius } from '../../../src/theme';

const ACTIVITY_OPTIONS: ActivityLevel[] = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'];
const GOAL_OPTIONS: Goal[] = ['Cut', 'Maintain', 'Bulk'];

export default function CalorieScreen() {
    const { user, userId, refreshUser } = useAuth();
    const api = ApiRegistry.instance;

    const [age, setAge] = useState(user?.profile.age?.toString() ?? '');
    const [gender, setGender] = useState<Gender>(user?.profile.gender ?? 'Male');
    const [weight, setWeight] = useState(user?.profile.weight?.toString() ?? '');
    const [height, setHeight] = useState(user?.profile.height?.toString() ?? '');
    const [activity, setActivity] = useState<ActivityLevel>('Moderately Active');
    const [goal, setGoal] = useState<Goal>('Maintain');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const result = useMemo(() => {
        const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age, 10);
        if (!w || !h || !a) return null;
        return CalorieCalculator.compute(w, h, a, gender, activity, goal);
    }, [weight, height, age, gender, activity, goal]);

    const onSave = async () => {
        if (!result || !userId) return;
        setSaveStatus('saving');
        setError(null);
        try {
            await api.users.update(userId, {
                profile: {
                    ...(user?.profile ?? {}),
                    age: parseInt(age, 10),
                    gender,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    tdee: result.tdee,
                    targetCalories: result.targetCalories,
                    targetProtein: result.macros.protein,
                    targetCarbs: result.macros.carbs,
                    targetFat: result.macros.fat,
                },
            });
            await refreshUser();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (e) {
            setError(formatError(e));
            setSaveStatus('error');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Screen scroll>
                <BackButton />

                <View style={styles.heroRow}>
                    <View style={styles.heroIcon}>
                        <Calculator color={colors.amber.base} size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Calorie Calculator</Text>
                        <Text style={styles.subtitle}>Mifflin-St Jeor formula</Text>
                    </View>
                </View>

                {error ? <Toast message={error} tone="error" /> : null}
                {saveStatus === 'saved' ? <Toast message="Saved to profile." tone="success" /> : null}

                <Card style={{ marginBottom: spacing.lg, gap: spacing.lg }}>
                    <View style={styles.row}>
                        <TextField label="Age" keyboardType="numeric" value={age} onChangeText={setAge} style={{ flex: 1 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <View style={styles.segmented}>
                                {(['Male', 'Female'] as Gender[]).map((g) => (
                                    <Pressable key={g} onPress={() => setGender(g)} style={[styles.segment, gender === g && styles.segmentActive]}>
                                        <Text style={[styles.segmentLabel, gender === g && styles.segmentLabelActive]}>{g}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <TextField label="Weight (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} style={{ flex: 1 }} />
                        <TextField label="Height (cm)" keyboardType="numeric" value={height} onChangeText={setHeight} style={{ flex: 1 }} />
                    </View>

                    <View>
                        <Text style={styles.fieldLabel}>Activity Level</Text>
                        <View style={styles.optionGrid}>
                            {ACTIVITY_OPTIONS.map((opt) => (
                                <Pressable key={opt} onPress={() => setActivity(opt)} style={[styles.option, activity === opt && styles.optionActive]}>
                                    <Text style={[styles.optionLabel, activity === opt && styles.optionLabelActive]}>{opt}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View>
                        <Text style={styles.fieldLabel}>Goal</Text>
                        <View style={styles.segmented}>
                            {GOAL_OPTIONS.map((g) => (
                                <Pressable key={g} onPress={() => setGoal(g)} style={[styles.segment, goal === g && styles.segmentActive]}>
                                    <Text style={[styles.segmentLabel, goal === g && styles.segmentLabelActive]}>{g}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </Card>

                {result ? (
                    <Card style={{ marginBottom: spacing.lg, alignItems: 'center', gap: spacing.md }}>
                        <View style={styles.resultBubble}>
                            <Flame color={colors.accent.cyanLight} size={26} />
                        </View>
                        <Text style={styles.resultValue}>{result.targetCalories} <Text style={styles.resultUnit}>kcal</Text></Text>
                        <Text style={styles.resultLabel}>{goal === 'Cut' ? 'Deficit' : goal === 'Bulk' ? 'Surplus' : 'Maintenance'} target</Text>
                        <Text style={styles.resultBmr}>Base TDEE: {result.tdee} kcal</Text>

                        <View style={styles.macroRow}>
                            <MacroChip label="Protein" value={result.macros.protein} unit="g" tone="indigo" />
                            <MacroChip label="Carbs" value={result.macros.carbs} unit="g" tone="emerald" />
                            <MacroChip label="Fat" value={result.macros.fat} unit="g" tone="amber" />
                        </View>
                    </Card>
                ) : null}

                <PrimaryButton
                    label={saveStatus === 'saved' ? 'Saved!' : 'Save to Profile'}
                    icon={<Save color={colors.bg.base} size={18} />}
                    onPress={onSave}
                    loading={saveStatus === 'saving'}
                    disabled={!result}
                    size="lg"
                />
            </Screen>
        </KeyboardAvoidingView>
    );
}

const MacroChip: React.FC<{ label: string; value: number; unit: string; tone: 'indigo' | 'emerald' | 'amber' }> = ({ label, value, unit, tone }) => {
    const tint = tone === 'indigo' ? colors.indigo.light : tone === 'emerald' ? colors.emerald.light : colors.amber.light;
    return (
        <View style={styles.macroChip}>
            <Text style={[styles.macroChipLabel, { color: tint }]}>{label}</Text>
            <Text style={styles.macroChipValue}>{value}{unit}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    heroIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.amber.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.small,
        color: colors.text.faint,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    fieldLabel: {
        ...typography.label,
        color: colors.text.muted,
        marginBottom: spacing.sm,
    },
    segmented: {
        flexDirection: 'row',
        backgroundColor: colors.bg.muted,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: radius.sm,
    },
    segmentActive: {
        backgroundColor: colors.accent.cyanSoft,
    },
    segmentLabel: {
        ...typography.bodyBold,
        color: colors.text.muted,
    },
    segmentLabelActive: {
        color: colors.accent.cyanLight,
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    option: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        backgroundColor: colors.bg.muted,
    },
    optionActive: {
        backgroundColor: colors.accent.cyanSoft,
        borderColor: colors.accent.cyan,
    },
    optionLabel: {
        ...typography.small,
        color: colors.text.muted,
        fontWeight: '600',
    },
    optionLabelActive: {
        color: colors.accent.cyanLight,
    },
    resultBubble: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.accent.cyan,
        backgroundColor: colors.bg.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultValue: {
        ...typography.display,
        fontSize: 44,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    resultUnit: {
        ...typography.label,
        color: colors.text.faint,
    },
    resultLabel: {
        ...typography.bodyBold,
        color: colors.text.muted,
    },
    resultBmr: {
        ...typography.small,
        color: colors.text.faint,
    },
    macroRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    macroChip: {
        flex: 1,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.muted,
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    macroChipLabel: {
        ...typography.label,
        marginBottom: 4,
    },
    macroChipValue: {
        ...typography.h3,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
});
