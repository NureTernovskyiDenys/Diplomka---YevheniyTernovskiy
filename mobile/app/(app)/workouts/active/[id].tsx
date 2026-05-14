import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { PrimaryButton, Loader, Toast, Badge, BackButton } from '../../../../src/components';
import { SetRow } from '../../../../src/components/SetRow';
import { RestTimerOverlay } from '../../../../src/components/RestTimerOverlay';
import { Workout, Exercise, WorkoutSession, ExerciseLog, SetLog } from '../../../../src/models';
import { ApiRegistry, formatError } from '../../../../src/services';
import { useAuth } from '../../../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../../../src/theme';

interface SetDraft { weight: string; reps: string; completed: boolean; completedAt?: string; }
interface ExerciseDraft {
    exerciseId: string;
    name: string;
    sets: SetDraft[];
    placeholders: { weight: number; reps: number }[]; // from last session
}

const REST_SEC = 90;

export default function ActiveWorkoutScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { userId } = useAuth();
    const api = ApiRegistry.instance;

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [drafts, setDrafts] = useState<ExerciseDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [restKey, setRestKey] = useState(0);
    const [restVisible, setRestVisible] = useState(false);
    const [startedAt] = useState(new Date());
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const w = await api.workouts.getById(id);
            setWorkout(w);

            const last: WorkoutSession | null = await api.workoutSessions.getLast(w.id).catch(() => null);
            const lastByExercise = new Map<string, SetLog[]>();
            last?.exercises.forEach((ex) => lastByExercise.set(ex.exerciseId, ex.sets));

            const exMeta = await Promise.all(
                w.exercises.map(async (e) => {
                    try { return await api.exercises.byId(e.exerciseId); }
                    catch { return null; }
                }),
            );

            const drafts: ExerciseDraft[] = w.exercises.map((e, i) => {
    const lastSets = lastByExercise.get(e.exerciseId) ?? [];
    const placeholders = lastSets.length > 0
        ? lastSets.map((s) => ({ weight: s.weight, reps: s.reps }))
        : [];
    // Always start with a single empty set. User taps "Add set" to add more,
    // each new set inherits the previous one's values (handled in addSet).
    const sets = [{ weight: '', reps: '', completed: false }];
    return {
        exerciseId: e.exerciseId,
        name: exMeta[i]?.name ?? 'Exercise',
        sets,
        placeholders,
    };
});
            setDrafts(drafts);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api, id]);

    useEffect(() => { load(); }, [load]);

    const updateSet = (exIdx: number, setIdx: number, patch: Partial<SetDraft>) =>
        setDrafts((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
            ...ex,
            sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, ...patch }),
        }));

    const completeSet = (exIdx: number, setIdx: number) => {
        const ex = drafts[exIdx];
        const set = ex.sets[setIdx];
        const ph = ex.placeholders[setIdx];
        const weight = set.weight || (ph ? String(ph.weight) : '');
        const reps = set.reps || (ph ? String(ph.reps) : '');
        if (!weight || !reps) return;
        updateSet(exIdx, setIdx, {
            weight, reps,
            completed: true,
            completedAt: new Date().toISOString(),
        });
        setRestKey((k) => k + 1);
        setRestVisible(true);
    };

    const addSet = (exIdx: number) =>
    setDrafts((prev) => prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
            ...ex,
            sets: [...ex.sets, {
                weight: last?.weight ?? '',
                reps: last?.reps ?? '',
                completed: false,
            }],
        };
    }));

    const deleteSet = (exIdx: number, setIdx: number) =>
        setDrafts((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
            ...ex,
            sets: ex.sets.filter((_, j) => j !== setIdx),
        }));

    const totals = useMemo(() => {
        let completed = 0; let total = 0; let volume = 0;
        drafts.forEach((ex) => ex.sets.forEach((s) => {
            total += 1;
            if (s.completed) {
                completed += 1;
                volume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
            }
        }));
        return { completed, total, volume };
    }, [drafts]);

    const handleFinish = async () => {
        if (!workout) return;
        if (totals.completed === 0) {
            Alert.alert('No sets logged', 'Complete at least one set before finishing.');
            return;
        }
        setSubmitting(true);
        const finishedAt = new Date();
        const exercises: ExerciseLog[] = drafts.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets
                .filter((s) => s.completed)
                .map((s) => ({
                    weight: parseFloat(s.weight),
                    reps: parseInt(s.reps),
                    completedAt: s.completedAt ?? finishedAt.toISOString(),
                })),
        })).filter((ex) => ex.sets.length > 0);

        try {
            await api.workoutSessions.create({
                workoutId: workout.id,
                startedAt: startedAt.toISOString(),
                finishedAt: finishedAt.toISOString(),
                durationSec: Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000),
                exercises,
            });
            // Optionally also record analytics:
            await api.analytics.recordSession({
                workoutId: workout.id,
                durationInMinutes: Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000),
                caloriesBurned: Math.round(totals.volume * 0.08),
                totalVolume: totals.volume,
            }).catch(() => null);
            const created = await api.workoutSessions.create({
    workoutId: workout.id,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationSec: Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000),
    exercises,
});
// Optionally also record analytics:
await api.analytics.recordSession({
    workoutId: workout.id,
    durationInMinutes: Math.round((finishedAt.getTime() - startedAt.getTime()) / 60000),
    caloriesBurned: Math.round(totals.volume * 0.08),
    totalVolume: totals.volume,
}).catch(() => null);
router.replace(`/(app)/workouts/summary/${workout.id}?sessionId=${created.id}` as any);
        } catch (e) {
            setError(formatError(e));
            setSubmitting(false);
        }
    };

    if (loading) return <Loader fullScreen label="Loading workout" />;
    if (!workout) return <Loader fullScreen label="Not found" />;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.topBar}>
                    <BackButton iconOnly />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title} numberOfLines={1}>{workout.name}</Text>
                        <Text style={styles.subtitle}>
                            {totals.completed}/{totals.total} sets · {Math.round(totals.volume)} kg vol
                        </Text>
                    </View>
                    <Badge label="LIVE" tone="danger" />
                </View>

                <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xl4 }} keyboardShouldPersistTaps="handled">
                    {restVisible ? (
                        <RestTimerOverlay key={restKey} seconds={REST_SEC} onSkip={() => setRestVisible(false)} />
                    ) : null}

                    {error ? <Toast message={error} tone="error" /> : null}

                    {drafts.map((ex, exIdx) => (
                        <View key={ex.exerciseId} style={styles.exerciseBlock}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            {ex.placeholders.length > 0 ? (
                                <Text style={styles.lastHint}>
                                    Last time: {ex.placeholders.slice(0, 4).map((p) => `${p.weight}×${p.reps}`).join(' · ')}
                                </Text>
                            ) : null}

                            {ex.sets.map((s, setIdx) => (
                                <SetRow
                                    key={setIdx}
                                    index={setIdx + 1}
                                    weight={s.weight}
                                    reps={s.reps}
                                    completed={s.completed}
                                    placeholder={ex.placeholders[setIdx] ?? null}
                                    onChangeWeight={(v) => updateSet(exIdx, setIdx, { weight: v })}
                                    onChangeReps={(v) => updateSet(exIdx, setIdx, { reps: v })}
                                    onComplete={() => completeSet(exIdx, setIdx)}
                                    onDelete={() => deleteSet(exIdx, setIdx)}
                                />
                            ))}

                            <Pressable onPress={() => addSet(exIdx)} style={styles.addSetBtn}>
                                <Plus color={colors.accent.cyanLight} size={16} />
                                <Text style={styles.addSetText}>Add set</Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        label={submitting ? 'Saving...' : 'Finish workout'}
                        loading={submitting}
                        onPress={handleFinish}
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.muted,
    },
    title: { ...typography.h3, color: colors.text.primary },
    subtitle: { ...typography.small, color: colors.text.muted, marginTop: 2 },
    exerciseBlock: { marginBottom: spacing.xl },
    exerciseName: { ...typography.bodyBold, color: colors.text.primary, marginBottom: spacing.xs },
    lastHint: { ...typography.small, color: colors.text.faint, marginBottom: spacing.md },
    addSetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderStyle: 'dashed',
        marginTop: spacing.xs,
    },
    addSetText: { ...typography.small, color: colors.accent.cyanLight, fontWeight: '700' },
    footer: {
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border.muted,
    },
});