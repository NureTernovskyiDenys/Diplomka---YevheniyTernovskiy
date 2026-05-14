import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trophy, Clock, Timer, Flame, Dumbbell, ChevronRight, Target } from 'lucide-react-native';

import { PrimaryButton, Loader, Toast } from '../../../../src/components';
import { Workout, WorkoutSession, Exercise } from '../../../../src/models';
import { ApiRegistry, formatError } from '../../../../src/services';
import { colors, spacing, typography, radius } from '../../../../src/theme';

export default function WorkoutSummaryScreen() {
    const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
    const router = useRouter();
    const api = ApiRegistry.instance;

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [exerciseDetails, setExerciseDetails] = useState<Record<string, Exercise>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const w = await api.workouts.getById(id);
            setWorkout(w);

            // Get session — by id if provided, otherwise the latest one for this workout.
            const sessions = await api.workoutSessions.listForWorkout(id);
            const target = sessionId
                ? sessions.find((s) => s.id === sessionId) ?? null
                : sessions[0] ?? null;
            setSession(target);

            if (target) {
                const exMeta = await Promise.all(
                    target.exercises.map(async (ex) => {
                        try { return [ex.exerciseId, await api.exercises.byId(ex.exerciseId)] as const; }
                        catch { return [ex.exerciseId, null] as const; }
                    }),
                );
                const map: Record<string, Exercise> = {};
                exMeta.forEach(([key, ex]) => { if (ex) map[key] = ex; });
                setExerciseDetails(map);
            }
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api, id, sessionId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Loader fullScreen label="Loading summary..." />;
    if (error || !workout || !session) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={{ padding: spacing.xl }}>
                    <Toast message={error ?? 'Session not found'} tone="error" />
                    <PrimaryButton label="Back to workouts" onPress={() => router.replace('/(app)/workouts' as any)} />
                </View>
            </SafeAreaView>
        );
    }

    // === computed metrics
    const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalReps = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0
    );
    const totalVolume = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
    );
    const durationSec = session.data.durationSec ?? 0;
    // Estimated active time: ~3s per rep is a reasonable approximation.
    const activeSec = Math.min(totalReps * 3, durationSec);
    const restSec = Math.max(0, durationSec - activeSec);
    const avgRestPerSet = totalSets > 0 ? Math.round(restSec / totalSets) : 0;
    const caloriesEstimate = Math.round(totalVolume * 0.08); // rough: ~0.08 kcal per kg moved

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.trophyCircle}>
                        <Trophy color={colors.accent.cyan} size={36} strokeWidth={2} />
                    </View>
                    <Text style={styles.heroKicker}>WORKOUT COMPLETE</Text>
                    <Text style={styles.heroTitle}>{workout.name}</Text>
                    <Text style={styles.heroSubtitle}>Great work — here's what you did.</Text>
                </View>

                {/* Headline metrics */}
                <View style={styles.headlineRow}>
                    <HeadlineStat
                        icon={<Clock color={colors.accent.cyanLight} size={18} />}
                        label="Duration"
                        value={formatDuration(durationSec)}
                    />
                    <HeadlineStat
                        icon={<Dumbbell color={colors.accent.cyanLight} size={18} />}
                        label="Volume"
                        value={`${Math.round(totalVolume)} kg`}
                    />
                </View>

                {/* Secondary metrics */}
                <View style={styles.secondaryGrid}>
                    <SecondaryStat
                        icon={<Target color={colors.text.muted} size={16} />}
                        label="Total sets"
                        value={String(totalSets)}
                    />
                    <SecondaryStat
                        icon={<Target color={colors.text.muted} size={16} />}
                        label="Total reps"
                        value={String(totalReps)}
                    />
                    <SecondaryStat
                        icon={<Timer color={colors.text.muted} size={16} />}
                        label="Active time"
                        value={formatDuration(activeSec)}
                    />
                    <SecondaryStat
                        icon={<Timer color={colors.text.muted} size={16} />}
                        label="Rest time"
                        value={formatDuration(restSec)}
                    />
                    <SecondaryStat
                        icon={<Timer color={colors.text.muted} size={16} />}
                        label="Avg rest/set"
                        value={`${avgRestPerSet}s`}
                    />
                    <SecondaryStat
                        icon={<Flame color={colors.text.muted} size={16} />}
                        label="Est. calories"
                        value={`${caloriesEstimate}`}
                    />
                </View>

                {/* Per-exercise breakdown */}
                <Text style={styles.sectionTitle}>Exercises</Text>
                {session.exercises.map((ex, i) => {
                    const meta = exerciseDetails[ex.exerciseId];
                    const exVolume = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
                    const heaviest = ex.sets.reduce((m, set) => Math.max(m, set.weight), 0);
                    return (
                        <View key={i} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <Text style={styles.exerciseName} numberOfLines={2}>
                                    {meta?.name ?? `Exercise ${ex.exerciseId}`}
                                </Text>
                                <Text style={styles.exerciseVolume}>{Math.round(exVolume)} kg</Text>
                            </View>
                            <View style={styles.exerciseStats}>
                                <Text style={styles.exerciseStat}>{ex.sets.length} sets</Text>
                                <Text style={styles.exerciseStatDot}>·</Text>
                                <Text style={styles.exerciseStat}>
                                    {ex.sets.reduce((s, set) => s + set.reps, 0)} reps
                                </Text>
                                <Text style={styles.exerciseStatDot}>·</Text>
                                <Text style={styles.exerciseStat}>top {heaviest} kg</Text>
                            </View>
                            <View style={styles.setsList}>
                                {ex.sets.map((set, setIdx) => (
                                    <View key={setIdx} style={styles.setItem}>
                                        <Text style={styles.setNumber}>{setIdx + 1}</Text>
                                        <Text style={styles.setText}>{set.weight} kg × {set.reps}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    label="Done"
                    onPress={() => router.replace('/(app)/workouts' as any)}
                    size="lg"
                />
            </View>
        </SafeAreaView>
    );
}

const HeadlineStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <View style={styles.headlineCard}>
        <View style={styles.headlineIcon}>{icon}</View>
        <Text style={styles.headlineLabel}>{label}</Text>
        <Text style={styles.headlineValue}>{value}</Text>
    </View>
);

const SecondaryStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <View style={styles.secondaryCard}>
        <View style={styles.secondaryHeader}>
            {icon}
            <Text style={styles.secondaryLabel}>{label}</Text>
        </View>
        <Text style={styles.secondaryValue}>{value}</Text>
    </View>
);

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },
    scroll: { padding: spacing.xl, paddingBottom: spacing.xl4 },
    hero: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xl2 },
    trophyCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.accent.cyanSoft,
        borderWidth: 2,
        borderColor: colors.accent.cyan,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    heroKicker: {
        ...typography.label,
        color: colors.accent.cyanLight,
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    heroTitle: { ...typography.display, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
    heroSubtitle: { ...typography.body, color: colors.text.muted, textAlign: 'center' },

    headlineRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    headlineCard: {
        flex: 1,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    headlineIcon: {
        width: 36, height: 36, borderRadius: radius.sm,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center', justifyContent: 'center',
    },
    headlineLabel: {
        ...typography.small,
        color: colors.text.faint,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
    },
    headlineValue: { ...typography.h1, color: colors.text.primary, fontSize: 26 },

    secondaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    secondaryCard: {
        flexBasis: '48%',
        flexGrow: 1,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.muted,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 4,
    },
    secondaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    secondaryLabel: {
        ...typography.small,
        color: colors.text.muted,
        fontSize: 11,
        fontWeight: '600',
    },
    secondaryValue: { ...typography.h3, color: colors.text.primary },

    sectionTitle: {
        ...typography.h2,
        color: colors.text.primary,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    exerciseCard: {
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
    exerciseName: { flex: 1, ...typography.bodyBold, color: colors.text.primary, textTransform: 'capitalize' },
    exerciseVolume: { ...typography.bodyBold, color: colors.accent.cyanLight },
    exerciseStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
    exerciseStat: { ...typography.small, color: colors.text.muted },
    exerciseStatDot: { ...typography.small, color: colors.text.veryFaint },
    setsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    setItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.bg.muted,
        borderRadius: radius.sm,
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
    },
    setNumber: {
        ...typography.small,
        color: colors.text.faint,
        fontSize: 10,
        fontWeight: '700',
    },
    setText: {
        ...typography.small,
        color: colors.text.primary,
        fontWeight: '600',
    },

    footer: {
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border.muted,
        backgroundColor: colors.bg.base,
    },
});