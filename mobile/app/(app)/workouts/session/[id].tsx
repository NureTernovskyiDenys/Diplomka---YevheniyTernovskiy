import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Clock, Dumbbell, Target, Timer, Flame, Check } from 'lucide-react-native';

import { Screen, Card, Loader, Toast, Badge, BackButton } from '../../../../src/components';
import { Workout, WorkoutSession, Exercise } from '../../../../src/models';
import { ApiRegistry, formatError } from '../../../../src/services';
import { colors, spacing, typography, radius } from '../../../../src/theme';

export default function SessionDetailScreen() {
    const { id, workoutId } = useLocalSearchParams<{ id: string; workoutId?: string }>();
    const api = ApiRegistry.instance;

    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exerciseDetails, setExerciseDetails] = useState<Record<string, Exercise>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            // Find session — listForWorkout requires a workoutId, so use the param,
            // or fall back to scanning all the user's workouts if not provided.
            let target: WorkoutSession | null = null;
            let parentWorkout: Workout | null = null;

            if (workoutId) {
                const list = await api.workoutSessions.listForWorkout(workoutId);
                target = list.find((s) => s.id === id) ?? null;
                if (target) parentWorkout = await api.workouts.getById(workoutId).catch(() => null);
            } else {
                const workouts = await api.workouts.listMine();
                for (const w of workouts) {
                    const list = await api.workoutSessions.listForWorkout(w.id).catch(() => []);
                    const found = list.find((s) => s.id === id);
                    if (found) {
                        target = found;
                        parentWorkout = w;
                        break;
                    }
                }
            }

            if (!target) {
                setError('Session not found');
                return;
            }
            setSession(target);
            setWorkout(parentWorkout);

            const exMeta = await Promise.all(
                target.exercises.map(async (ex) => {
                    try { return [ex.exerciseId, await api.exercises.byId(ex.exerciseId)] as const; }
                    catch { return [ex.exerciseId, null] as const; }
                }),
            );
            const map: Record<string, Exercise> = {};
            exMeta.forEach(([key, ex]) => { if (ex) map[key] = ex; });
            setExerciseDetails(map);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api, id, workoutId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Loader fullScreen label="Loading session..." />;
    if (error || !session) {
        return (
            <Screen>
                <BackButton />
                <Toast message={error ?? 'Session not found'} tone="error" />
            </Screen>
        );
    }

    const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalReps = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0
    );
    const totalVolume = session.exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
    );
    const durationSec = session.data.durationSec ?? 0;
    const activeSec = Math.min(totalReps * 3, durationSec);
    const restSec = Math.max(0, durationSec - activeSec);
    const caloriesEstimate = Math.round(totalVolume * 0.08);

    return (
        <Screen scroll>
            <BackButton />

            <View style={styles.header}>
                <Badge tone="emerald" label="Completed" icon={<Check color={colors.emerald.light} size={12} />} />
                <Text style={styles.title}>{workout?.name ?? 'Workout'}</Text>
                <Text style={styles.subtitle}>{formatDate(session.data.finishedAt ?? session.data.startedAt)}</Text>
            </View>

            <View style={styles.statsGrid}>
                <Stat icon={<Clock color={colors.accent.cyanLight} size={16} />} label="Duration" value={formatDuration(durationSec)} />
                <Stat icon={<Dumbbell color={colors.accent.cyanLight} size={16} />} label="Volume" value={`${Math.round(totalVolume)} kg`} />
                <Stat icon={<Target color={colors.text.muted} size={16} />} label="Sets" value={String(totalSets)} />
                <Stat icon={<Target color={colors.text.muted} size={16} />} label="Reps" value={String(totalReps)} />
                <Stat icon={<Timer color={colors.text.muted} size={16} />} label="Active" value={formatDuration(activeSec)} />
                <Stat icon={<Timer color={colors.text.muted} size={16} />} label="Rest" value={formatDuration(restSec)} />
                <Stat icon={<Flame color={colors.text.muted} size={16} />} label="Calories" value={`${caloriesEstimate}`} />
            </View>

            <Text style={styles.sectionTitle}>Exercises</Text>

            {session.exercises.map((ex, exIdx) => {
                const meta = exerciseDetails[ex.exerciseId];
                const exVolume = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
                const heaviest = ex.sets.reduce((m, set) => Math.max(m, set.weight), 0);
                return (
                    <Card key={exIdx} style={styles.exerciseCard}>
                        <View style={styles.exerciseHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.exerciseName} numberOfLines={2}>
                                    {meta?.name ?? `Exercise ${ex.exerciseId}`}
                                </Text>
                                {meta?.primaryTarget ? (
                                    <Text style={styles.exerciseMeta}>
                                        {meta.primaryTarget}{meta.equipmentLabel ? ` • ${meta.equipmentLabel}` : ''}
                                    </Text>
                                ) : null}
                            </View>
                            <Text style={styles.exerciseVolume}>{Math.round(exVolume)} kg</Text>
                        </View>

                        <View style={styles.exerciseStats}>
                            <Text style={styles.exerciseStat}>{ex.sets.length} sets</Text>
                            <Text style={styles.dot}>·</Text>
                            <Text style={styles.exerciseStat}>
                                {ex.sets.reduce((s, set) => s + set.reps, 0)} reps
                            </Text>
                            <Text style={styles.dot}>·</Text>
                            <Text style={styles.exerciseStat}>top {heaviest} kg</Text>
                        </View>

                        <View style={styles.divider} />

                        {ex.sets.map((set, setIdx) => (
                            <View key={setIdx} style={styles.setRow}>
                                <View style={styles.indexBubble}>
                                    <Text style={styles.indexText}>{setIdx + 1}</Text>
                                </View>
                                <View style={styles.setMetric}>
                                    <Text style={styles.setMetricValue}>{set.weight}</Text>
                                    <Text style={styles.setMetricUnit}>kg</Text>
                                </View>
                                <Text style={styles.times}>×</Text>
                                <View style={styles.setMetric}>
                                    <Text style={styles.setMetricValue}>{set.reps}</Text>
                                    <Text style={styles.setMetricUnit}>reps</Text>
                                </View>
                                <View style={{ flex: 1 }} />
                                <View style={styles.doneBadge}>
                                    <Check color={colors.emerald.light} size={14} strokeWidth={3} />
                                </View>
                            </View>
                        ))}
                    </Card>
                );
            })}
        </Screen>
    );
}

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <View style={styles.statCard}>
        <View style={styles.statHeader}>
            {icon}
            <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
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

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
        + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
    header: { marginBottom: spacing.xl, gap: spacing.sm, alignItems: 'flex-start' },
    title: { ...typography.h1, color: colors.text.primary },
    subtitle: { ...typography.small, color: colors.text.muted },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    statCard: {
        flexBasis: '48%',
        flexGrow: 1,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.muted,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 4,
    },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    statLabel: {
        ...typography.small, color: colors.text.muted,
        fontSize: 11, fontWeight: '600',
    },
    statValue: { ...typography.h3, color: colors.text.primary },
    sectionTitle: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.lg,
    },
    exerciseCard: { marginBottom: spacing.md },
    exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.xs },
    exerciseName: { ...typography.bodyBold, color: colors.text.primary, textTransform: 'capitalize' },
    exerciseMeta: { ...typography.small, color: colors.text.faint, marginTop: 2, textTransform: 'capitalize' },
    exerciseVolume: { ...typography.bodyBold, color: colors.accent.cyanLight },
    exerciseStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    exerciseStat: { ...typography.small, color: colors.text.muted },
    dot: { ...typography.small, color: colors.text.veryFaint },
    divider: {
        height: 1,
        backgroundColor: colors.border.muted,
        marginVertical: spacing.md,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xs,
    },
    indexBubble: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: colors.bg.muted,
        alignItems: 'center', justifyContent: 'center',
    },
    indexText: { ...typography.small, color: colors.text.muted, fontWeight: '700', fontSize: 11 },
    setMetric: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    setMetricValue: { ...typography.bodyBold, color: colors.text.primary, fontSize: 16 },
    setMetricUnit: { ...typography.small, color: colors.text.faint, fontSize: 11 },
    times: { ...typography.body, color: colors.text.faint },
    doneBadge: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: colors.emerald.soft,
        alignItems: 'center', justifyContent: 'center',
    },
});