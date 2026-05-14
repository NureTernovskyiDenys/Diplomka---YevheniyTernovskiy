import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Activity, Award, Clock, Dumbbell, Flame, Lock, Sparkles, TrendingUp } from 'lucide-react-native';

import { BarChart, ChartPoint, EmptyState, LineChart, Loader, Screen, Toast } from '../../src/components';
import { Exercise, WorkoutSession } from '../../src/models';
import { ApiRegistry, formatError } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import { colors, radius, spacing, typography } from '../../src/theme';

interface SessionEntry {
    session: WorkoutSession;
    workoutName: string;
    finishedAt: Date;
    totalVolume: number;
    durationSec: number;
}

interface ExerciseProgress {
    exerciseId: string;
    name: string;
    sessionCount: number;
    bestE1RM: number;
    points: ChartPoint[];
}

const epley = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    return weight * (1 + reps / 30);
};

const startOfWeek = (d: Date): Date => {
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    const day = (out.getDay() + 6) % 7;
    out.setDate(out.getDate() - day);
    return out;
};

const startOfDay = (d: Date): Date => {
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    return out;
};

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.max(0, Math.round(seconds))}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remain = mins % 60;
    return remain ? `${hrs}h ${remain}m` : `${hrs}h`;
};

const formatVolume = (kg: number): string => {
    if (kg >= 10000) return `${(kg / 1000).toFixed(1)}t`;
    if (kg >= 1000) return `${(kg / 1000).toFixed(2)}t`;
    return `${Math.round(kg)} kg`;
};

const computeStreak = (sessions: SessionEntry[]): number => {
    if (sessions.length === 0) return 0;
    const days = new Set(sessions.map((s) => startOfDay(s.finishedAt).getTime()));
    let cursor = startOfDay(new Date());
    if (!days.has(cursor.getTime())) {
        cursor = new Date(cursor.getTime() - 86_400_000);
        if (!days.has(cursor.getTime())) return 0;
    }
    let streak = 0;
    while (days.has(cursor.getTime())) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86_400_000);
    }
    return streak;
};

export default function ProgressScreen() {
    const api = ApiRegistry.instance;
    const { user } = useAuth();
    const router = useRouter();

    const isPremium = !!user?.subscription?.planId;

    const [entries, setEntries] = useState<SessionEntry[]>([]);
    const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const workouts = await api.workouts.listMine();
            const grouped = await Promise.all(
                workouts.map(async (w) => {
                    try {
                        const sessions = await api.workoutSessions.listForWorkout(w.id);
                        return { workout: w, sessions };
                    } catch {
                        return { workout: w, sessions: [] as WorkoutSession[] };
                    }
                }),
            );

            const all: SessionEntry[] = [];
            grouped.forEach(({ workout, sessions }) => {
                sessions.forEach((s) => {
                    const finishedIso = s.data.finishedAt ?? s.data.startedAt;
                    const finishedAt = new Date(finishedIso);
                    const totalVolume = s.exercises.reduce(
                        (sum, ex) => sum + ex.sets.reduce((acc, set) => acc + set.weight * set.reps, 0),
                        0,
                    );
                    all.push({
                        session: s,
                        workoutName: workout.name,
                        finishedAt,
                        totalVolume,
                        durationSec: s.data.durationSec ?? 0,
                    });
                });
            });
            all.sort((a, b) => a.finishedAt.getTime() - b.finishedAt.getTime());
            setEntries(all);

            const perExerciseSessions = new Map<
                string,
                { date: Date; e1rm: number; sessionId: string }[]
            >();

            all.forEach((entry) => {
                entry.session.exercises.forEach((ex) => {
                    const best = ex.sets.reduce(
                        (max, set) => Math.max(max, epley(set.weight, set.reps)),
                        0,
                    );
                    if (best <= 0) return;
                    if (!perExerciseSessions.has(ex.exerciseId)) {
                        perExerciseSessions.set(ex.exerciseId, []);
                    }
                    perExerciseSessions.get(ex.exerciseId)!.push({
                        date: entry.finishedAt,
                        e1rm: best,
                        sessionId: entry.session.id,
                    });
                });
            });

            const topExerciseIds = [...perExerciseSessions.entries()]
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 5)
                .map(([id]) => id);

            const exerciseDetails = await Promise.all(
                topExerciseIds.map(async (id) => {
                    try {
                        return [id, await api.exercises.byId(id)] as const;
                    } catch {
                        return [id, null] as const;
                    }
                }),
            );

            const progress: ExerciseProgress[] = topExerciseIds.map((id) => {
                const samples = perExerciseSessions.get(id) ?? [];
                samples.sort((a, b) => a.date.getTime() - b.date.getTime());
                const meta = exerciseDetails.find(([eid]) => eid === id)?.[1] ?? null;
                const points: ChartPoint[] = samples.map((s, i) => ({
                    label: String(i + 1),
                    value: Math.round(s.e1rm * 10) / 10,
                }));
                const bestE1RM = samples.reduce((m, s) => Math.max(m, s.e1rm), 0);
                return {
                    exerciseId: id,
                    name: (meta as Exercise | null)?.name ?? `Exercise ${id}`,
                    sessionCount: samples.length,
                    bestE1RM,
                    points,
                };
            });
            setExerciseProgress(progress);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    if (loading) return <Loader fullScreen label="Loading progress..." />;

    const totalVolume = entries.reduce((s, e) => s + e.totalVolume, 0);
    const totalSessions = entries.length;
    const totalSeconds = entries.reduce((s, e) => s + e.durationSec, 0);
    const streak = computeStreak(entries);

    const volumePoints: ChartPoint[] = entries
        .slice(-10)
        .map((e, i) => ({
            label: String(i + 1),
            value: Math.round(e.totalVolume),
        }));

    const weekStart = startOfWeek(new Date());
    const weeks: { start: Date; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
        const start = new Date(weekStart);
        start.setDate(start.getDate() - i * 7);
        weeks.push({ start, count: 0 });
    }
    entries.forEach((e) => {
        const ws = startOfWeek(e.finishedAt);
        const bucket = weeks.find((w) => w.start.getTime() === ws.getTime());
        if (bucket) bucket.count += 1;
    });
    const weekLabel = (d: Date): string => {
        const month = d.toLocaleDateString(undefined, { month: 'short' });
        return `${month} ${d.getDate()}`;
    };
    const frequencyPoints = weeks.map((w) => ({ label: weekLabel(w.start), value: w.count }));

    const premiumContent = (
        <Screen scroll>
            <View style={styles.header}>
                <Text style={styles.title}>Progress</Text>
                <Text style={styles.subtitle}>Your training trends and personal records</Text>
            </View>

            {error ? <Toast message={error} tone="error" /> : null}

            {entries.length === 0 ? (
                <EmptyState
                    icon={<TrendingUp color={colors.text.faint} size={36} />}
                    title="No data yet"
                    description="Complete a workout to start seeing your progress charts."
                />
            ) : (
                <>
                    <View style={styles.statsGrid}>
                        <HeadlineStat
                            icon={<Dumbbell color={colors.accent.cyanLight} size={18} />}
                            tint={colors.accent.cyanSoft}
                            label="Total volume"
                            value={formatVolume(totalVolume)}
                        />
                        <HeadlineStat
                            icon={<Activity color={colors.indigo.light} size={18} />}
                            tint={colors.indigo.soft}
                            label="Sessions"
                            value={String(totalSessions)}
                        />
                        <HeadlineStat
                            icon={<Flame color={colors.amber.light} size={18} />}
                            tint={colors.amber.soft}
                            label="Day streak"
                            value={`${streak}d`}
                        />
                        <HeadlineStat
                            icon={<Clock color={colors.emerald.light} size={18} />}
                            tint={colors.emerald.soft}
                            label="Time trained"
                            value={formatDuration(totalSeconds)}
                        />
                    </View>

                    <ChartCard
                        title="Volume per session"
                        subtitle="Total kg moved · last 10 sessions"
                    >
                        <LineChart data={volumePoints} color={colors.accent.cyanLight} />
                    </ChartCard>

                    <ChartCard
                        title="Training frequency"
                        subtitle="Sessions per week · last 8 weeks"
                    >
                        <BarChart data={frequencyPoints} color={colors.indigo.light} />
                    </ChartCard>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Strength progression</Text>
                        <Text style={styles.sectionSubtitle}>
                            Estimated 1-rep max over time · top 5 exercises
                        </Text>
                    </View>

                    {exerciseProgress.length === 0 ? (
                        <EmptyState
                            icon={<Award color={colors.text.faint} size={32} />}
                            title="No strength data"
                            description="Log a few weighted sets to unlock 1RM tracking."
                        />
                    ) : (
                        exerciseProgress.map((ex) => (
                            <View key={ex.exerciseId} style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseName} numberOfLines={2}>
                                        {ex.name}
                                    </Text>
                                    <View style={styles.bestPill}>
                                        <Award color={colors.emerald.light} size={12} />
                                        <Text style={styles.bestPillText}>
                                            Best {Math.round(ex.bestE1RM)} kg
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.exerciseMeta}>
                                    {ex.sessionCount} session{ex.sessionCount === 1 ? '' : 's'}
                                </Text>
                                <View style={styles.chartWrap}>
                                    <LineChart data={ex.points} color={colors.emerald.light} height={150} />
                                </View>
                            </View>
                        ))
                    )}
                </>
            )}
        </Screen>
    );

    if (!isPremium) {
        return (
            <View style={styles.gateWrapper}>
                {/* Blurred non-scrollable preview behind gate */}
                <View style={styles.blurredBg} pointerEvents="none">
                    <View style={styles.header}>
                        <Text style={styles.title}>Progress</Text>
                        <Text style={styles.subtitle}>Your training trends and personal records</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        <HeadlineStat icon={<Dumbbell color={colors.accent.cyanLight} size={18} />} tint={colors.accent.cyanSoft} label="Total volume" value="—" />
                        <HeadlineStat icon={<Activity color={colors.indigo.light} size={18} />} tint={colors.indigo.soft} label="Sessions" value="—" />
                        <HeadlineStat icon={<Flame color={colors.amber.light} size={18} />} tint={colors.amber.soft} label="Day streak" value="—" />
                        <HeadlineStat icon={<Clock color={colors.emerald.light} size={18} />} tint={colors.emerald.soft} label="Time trained" value="—" />
                    </View>
                    <View style={styles.fakeLine} />
                    <View style={styles.fakeLine} />
                    <View style={styles.fakeLine} />
                </View>

                {/* Gate overlay — fixed to screen, not scrollable */}
                <View style={styles.gateOverlay}>
                    <View style={styles.gateCard}>
                        <View style={styles.gateIconWrap}>
                            <Sparkles color={colors.accent.cyanLight} size={32} />
                        </View>
                        <Text style={styles.gateTitle}>Premium Feature</Text>
                        <Text style={styles.gateSubtitle}>
                            Unlock detailed progress analytics, strength tracking, and training insights.
                        </Text>
                        <Pressable
                            style={styles.gateButton}
                            onPress={() => router.push('/(app)/subscriptions' as any)}
                        >
                            <Lock color={colors.bg.base} size={16} />
                            <Text style={styles.gateButtonText}>Get Premium Access</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    return premiumContent;
}

const HeadlineStat: React.FC<{
    icon: React.ReactNode;
    tint: string;
    label: string;
    value: string;
}> = ({ icon, tint, label, value }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: tint }]}>{icon}</View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const ChartCard: React.FC<{
    title: string;
    subtitle: string;
    children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
    <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartSubtitle}>{subtitle}</Text>
        <View style={styles.chartWrap}>{children}</View>
    </View>
);

const styles = StyleSheet.create({
    header: { marginBottom: spacing.xl },
    title: { ...typography.h1, color: colors.text.primary },
    subtitle: { ...typography.small, color: colors.text.faint, marginTop: 4 },

    // Premium gate
    gateWrapper: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    blurredBg: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4,
        overflow: 'hidden',
        padding: spacing.lg,
        paddingTop: spacing.xl,
        filter: 'blur(8px)',
    } as any,
    fakeLine: {
        height: 100,
        backgroundColor: colors.bg.surface,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    gateOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    gateCard: {
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.accent.cyan,
        borderRadius: radius.lg,
        padding: spacing.xl2,
        alignItems: 'center',
        gap: spacing.md,
        width: '100%',
        maxWidth: 340,
        shadowColor: colors.accent.cyan,
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
    },
    gateIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    gateTitle: {
        ...typography.h2,
        color: colors.text.primary,
        textAlign: 'center',
    },
    gateSubtitle: {
        ...typography.body,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 22,
    },
    gateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.accent.cyan,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        marginTop: spacing.sm,
    },
    gateButtonText: {
        ...typography.bodyBold,
        color: colors.bg.base,
    },

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
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    statIcon: {
        width: 36, height: 36, borderRadius: radius.sm,
        alignItems: 'center', justifyContent: 'center',
    },
    statLabel: {
        ...typography.small,
        color: colors.text.faint,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
    },
    statValue: { ...typography.h1, color: colors.text.primary, fontSize: 24 },

    chartCard: {
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    chartTitle: { ...typography.h3, color: colors.text.primary },
    chartSubtitle: { ...typography.small, color: colors.text.muted, marginTop: 2, marginBottom: spacing.md },
    chartWrap: { marginTop: spacing.sm },

    section: { marginTop: spacing.md, marginBottom: spacing.md },
    sectionTitle: { ...typography.h2, color: colors.text.primary },
    sectionSubtitle: { ...typography.small, color: colors.text.muted, marginTop: 2 },

    exerciseCard: {
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    exerciseName: {
        flex: 1,
        ...typography.bodyBold,
        color: colors.text.primary,
        textTransform: 'capitalize',
    },
    bestPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.emerald.soft,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    bestPillText: {
        ...typography.small,
        color: colors.emerald.light,
        fontWeight: '700',
        fontSize: 11,
    },
    exerciseMeta: { ...typography.small, color: colors.text.faint, marginTop: 2 },
});
