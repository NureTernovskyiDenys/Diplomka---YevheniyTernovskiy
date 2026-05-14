import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
    Trash2, Sparkles, Plus, ShieldCheck, ShieldAlert, AlertTriangle, ThumbsUp, Play, Lock,
} from 'lucide-react-native';

import { Screen, Card, PrimaryButton, Loader, Badge, EmptyState, Toast, BackButton } from '../../../src/components';
import { Workout, WorkoutExercise, AiRecommendation, Exercise } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const api = ApiRegistry.instance;
    const { user } = useAuth();

    const isPremium = user?.subscription?.active === true;

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exerciseDetails, setExerciseDetails] = useState<Record<string, Exercise>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
    const [recommending, setRecommending] = useState(false);
    const [recommendError, setRecommendError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        setError(null);
        try {
            const w = await api.workouts.getById(id);
            setWorkout(w);
            const cached = { ...exerciseDetails };
            const missing = w.exercises.filter((e) => !cached[e.exerciseId]);
            if (missing.length > 0) {
                const fetched = await Promise.all(
                    missing.map(async (e) => {
                        try { return [e.exerciseId, await api.exercises.byId(e.exerciseId)] as const; }
                        catch { return [e.exerciseId, null] as const; }
                    }),
                );
                fetched.forEach(([key, ex]) => { if (ex) cached[key] = ex; });
                setExerciseDetails(cached);
            }
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, id]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleRemoveExercise = async (exerciseObjId: string, exerciseName: string) => {
        if (!workout) return;

        const confirmed = typeof window !== 'undefined' && typeof window.confirm === 'function'
            ? window.confirm(`Remove "${exerciseName}" from this workout?`)
            : await new Promise<boolean>((resolve) => {
                Alert.alert(
                    'Remove exercise?',
                    `Remove "${exerciseName}" from this workout?`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
                    ],
                );
            });

        if (!confirmed) return;

        try {
            const updated = await api.workouts.removeExercise(workout.id, exerciseObjId);
            setWorkout(updated);
        } catch (e) {
            const msg = formatError(e);
            if (typeof window !== 'undefined') window.alert(`Remove failed: ${msg}`);
            else Alert.alert('Remove failed', msg);
        }
    };

    const handleDeleteWorkout = async () => {
        if (!workout) return;

        const confirmed = typeof window !== 'undefined' && typeof window.confirm === 'function'
            ? window.confirm(`"${workout.name}" will be removed permanently. Continue?`)
            : await new Promise<boolean>((resolve) => {
                Alert.alert(
                    'Delete workout?',
                    `"${workout.name}" will be removed permanently.`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ],
                );
            });

        if (!confirmed) return;

        try {
            await api.workouts.delete(workout.id);
            setWorkout(null);
            setError(null);
            router.replace('/(app)/workouts' as any);
        } catch (e) {
            const msg = formatError(e);
            if (typeof window !== 'undefined') window.alert(`Delete failed: ${msg}`);
            else Alert.alert('Delete failed', msg);
        }
    };

    const handleRequestRecommendation = async () => {
        if (!isPremium) {
            router.push('/(app)/subscriptions' as any);
            return;
        }
        if (!workout) return;
        setRecommending(true);
        setRecommendError(null);
        try {
            const rec = await api.workouts.getRecommendation(workout.id);
            setRecommendation(rec);
        } catch (e) {
            setRecommendError(formatError(e));
        } finally {
            setRecommending(false);
        }
    };

    const handleStartWorkout = () => {
        if (!workout) return;
        if (workout.exercises.length === 0) {
            const msg = 'Add at least one exercise from the Library before starting.';
            if (typeof window !== 'undefined') window.alert(msg);
            else Alert.alert('No exercises', msg);
            return;
        }
        router.push(`/(app)/workouts/active/${workout.id}` as any);
    };

    if (loading) return <Loader fullScreen label="Loading workout..." />;
    if (error || !workout) {
        return (
            <Screen>
                <BackButton />
                <Toast message={error ?? 'Workout not found'} tone="error" />
            </Screen>
        );
    }

    return (
        <Screen scroll>
            <View style={styles.topBar}>
                <BackButton style={{ marginBottom: 0 }} />
                <Pressable onPress={handleDeleteWorkout} hitSlop={8} style={styles.headerDeleteBtn}>
                    <Trash2 color={colors.text.muted} size={16} />
                    <Text style={styles.headerDeleteText}>Delete workout</Text>
                </Pressable>
            </View>

            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{workout.name}</Text>
                    <Text style={styles.subtitle}>
                        {workout.exerciseCount} exercises
                    </Text>
                </View>
            </View>

            <PrimaryButton
                label="Start workout"
                onPress={handleStartWorkout}
                size="lg"
                icon={<Play color={colors.bg.base} size={18} fill={colors.bg.base} />}
                style={{ marginBottom: spacing.lg }}
            />

            <Card style={{ marginBottom: spacing.lg }}>
                <View style={styles.aiHeader}>
                    <View style={styles.aiHeaderLeft}>
                        <View style={styles.aiIcon}>
                            <Sparkles color={colors.accent.cyanLight} size={18} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.aiTitle}>AI Coach Review</Text>
                            <Text style={styles.aiSubtitle}>
                                Get a personalized safety + form analysis based on your profile.
                            </Text>
                        </View>
                    </View>
                </View>
                {recommendError ? <Toast message={recommendError} tone="error" /> : null}
                {!recommendation ? (
                    <>
                        {!isPremium && (
                            <View style={styles.premiumHint}>
                                <Lock color={colors.accent.cyanLight} size={14} />
                                <Text style={styles.premiumHintText}>
                                    Premium feature — tap below to unlock
                                </Text>
                            </View>
                        )}
                        <PrimaryButton
                            label={
                                !isPremium
                                    ? 'Unlock AI Analysis'
                                    : recommending
                                        ? 'Analyzing...'
                                        : 'Run AI Analysis'
                            }
                            onPress={handleRequestRecommendation}
                            loading={recommending}
                            size="md"
                        />
                    </>
                ) : (
                    <RecommendationView rec={recommendation} />
                )}
            </Card>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <Pressable
                    onPress={() => router.push(`/(app)/exercises?fromWorkout=${workout.id}` as any)}
                    style={styles.addExerciseBtn}
                    hitSlop={8}
                >
                    <Plus color={colors.accent.cyanLight} size={18} />
                </Pressable>
            </View>

            {workout.exercises.length === 0 ? (
                <EmptyState
                    icon={<Plus color={colors.text.faint} size={36} />}
                    title="No exercises yet"
                    description="Browse the Library and tap + on any exercise to add it here."
                    action={
                        <PrimaryButton
                            label="Open Library"
                            onPress={() => router.push(`/(app)/exercises?fromWorkout=${workout.id}` as any)}
                            size="md"
                            fullWidth={false}
                        />
                    }
                />
            ) : (
                workout.exercises.map((ex, idx) => (
                    <ExerciseRow
                        key={ex.id ?? `${ex.exerciseId}-${idx}`}
                        item={ex}
                        meta={exerciseDetails[ex.exerciseId]}
                        recommendation={recommendation}
                        onRemove={() => ex.id && handleRemoveExercise(
                            ex.id,
                            exerciseDetails[ex.exerciseId]?.name ?? 'this exercise'
                        )}
                    />
                ))
            )}
        </Screen>
    );
}

const RecommendationView: React.FC<{ rec: AiRecommendation }> = ({ rec }) => {
    return (
        <View style={{ gap: spacing.md }}>
            <View style={styles.safetyRow}>
                {rec.isSafe ? (
                    <Badge tone="emerald" label="Routine looks safe" icon={<ShieldCheck color={colors.emerald.light} size={12} />} />
                ) : (
                    <Badge tone="rose" label="Review required" icon={<ShieldAlert color={colors.rose.light} size={12} />} />
                )}
            </View>
            {rec.generalAdvice ? <Text style={styles.advice}>{rec.generalAdvice}</Text> : null}
            {rec.warnings.length > 0 ? (
                <View>
                    <Text style={[styles.aiSubsection, { color: colors.rose.light }]}>Warnings</Text>
                    {rec.warnings.map((w, i) => (
                        <View key={i} style={styles.bulletRow}>
                            <AlertTriangle color={colors.rose.light} size={14} />
                            <Text style={styles.bulletText}>{w}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
            {rec.positives.length > 0 ? (
                <View>
                    <Text style={[styles.aiSubsection, { color: colors.emerald.light }]}>Strengths</Text>
                    {rec.positives.map((p, i) => (
                        <View key={i} style={styles.bulletRow}>
                            <ThumbsUp color={colors.emerald.light} size={14} />
                            <Text style={styles.bulletText}>{p}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
};

const ExerciseRow: React.FC<{
    item: WorkoutExercise;
    meta?: Exercise;
    recommendation: AiRecommendation | null;
    onRemove: () => void;
}> = ({ item, meta, recommendation, onRemove }) => {
    const status = recommendation?.statusFor(item.exerciseId);
    const tone = status === 'Recommended' ? 'emerald'
        : status === 'Not Recommended' ? 'rose'
            : status === 'Consult Doctor' ? 'amber'
                : 'neutral';

    return (
        <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.exerciseHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName} numberOfLines={2}>
                        {meta?.name ?? `Exercise ${item.exerciseId}`}
                    </Text>
                    {meta?.primaryTarget ? (
                        <Text style={styles.exerciseMeta}>
                            {meta.primaryTarget}{meta.equipmentLabel ? ` • ${meta.equipmentLabel}` : ''}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.exerciseActions}>
                    {status ? <Badge tone={tone} label={status} /> : null}
                    <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
                        <Trash2 color={colors.danger.light} size={16} />
                    </Pressable>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    headerDeleteBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
    },
    headerDeleteText: { ...typography.small, color: colors.text.muted, fontWeight: '600' },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
    title: { ...typography.h1, color: colors.text.primary },
    subtitle: { ...typography.small, color: colors.text.faint, marginTop: 4 },
    aiHeader: { marginBottom: spacing.md },
    aiHeaderLeft: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    aiIcon: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center', justifyContent: 'center',
    },
    aiTitle: { ...typography.h3, color: colors.text.primary },
    aiSubtitle: { ...typography.small, color: colors.text.faint, marginTop: 2 },
    premiumHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    premiumHintText: {
        ...typography.small,
        color: colors.accent.cyanLight,
        fontWeight: '600',
    },
    safetyRow: { flexDirection: 'row', gap: spacing.sm },
    advice: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },
    aiSubsection: { ...typography.label, marginBottom: spacing.sm },
    bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs, alignItems: 'flex-start' },
    bulletText: { flex: 1, ...typography.small, color: colors.text.secondary, lineHeight: 18 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    sectionTitle: { ...typography.h2, color: colors.text.primary },
    addExerciseBtn: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.accent.cyanSoft,
        borderWidth: 1,
        borderColor: colors.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseHeader: {
        flexDirection: 'row', alignItems: 'center',
        gap: spacing.md,
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    removeBtn: {
        width: 32, height: 32, borderRadius: radius.sm,
        backgroundColor: colors.danger.soft,
        alignItems: 'center', justifyContent: 'center',
    },
    exerciseName: { ...typography.h3, color: colors.text.primary, textTransform: 'capitalize' },
    exerciseMeta: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
        textTransform: 'capitalize',
    },
});
