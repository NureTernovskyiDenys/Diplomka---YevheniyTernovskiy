import React, { useCallback, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronRight, Trophy, BarChart3 } from 'lucide-react-native';

import { Screen, Card, Loader, Toast, EmptyState, BackButton } from '../../src/components';
import { Workout, WorkoutSession } from '../../src/models';
import { ApiRegistry, formatError } from '../../src/services';
import { colors, spacing, typography, radius } from '../../src/theme';

interface HistoryItem {
    sessionId: string;
    workoutId: string;
    workoutName: string;
    finishedAt: string;
    durationSec: number;
    totalSets: number;
    totalVolume: number;
}

export default function WorkoutHistoryScreen() {
    const router = useRouter();
    const api = ApiRegistry.instance;

    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const workouts = await api.workouts.listMine();
            const grouped = await Promise.all(
                workouts.map(async (w): Promise<{ workout: Workout; sessions: WorkoutSession[] }> => {
                    try {
                        const list = await api.workoutSessions.listForWorkout(w.id);
                        return { workout: w, sessions: list };
                    } catch {
                        return { workout: w, sessions: [] };
                    }
                }),
            );
            const all: HistoryItem[] = [];
            grouped.forEach(({ workout, sessions }) => {
                sessions.forEach((s) => {
                    const totalSets = s.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                    const totalVolume = s.exercises.reduce(
                        (sum, ex) => sum + ex.sets.reduce((acc, set) => acc + set.weight * set.reps, 0),
                        0,
                    );
                    all.push({
                        sessionId: s.id,
                        workoutId: workout.id,
                        workoutName: workout.name,
                        finishedAt: s.data.finishedAt ?? s.data.startedAt,
                        durationSec: s.data.durationSec ?? 0,
                        totalSets,
                        totalVolume,
                    });
                });
            });
            all.sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime());
            setItems(all);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (loading) return <Loader fullScreen label="Loading history..." />;

    return (
        <Screen scroll>
            <BackButton />

            <View style={styles.header}>
                <Text style={styles.title}>Workout History</Text>
                <Text style={styles.subtitle}>
                    {items.length} session{items.length === 1 ? '' : 's'} logged
                </Text>
            </View>

            {error ? <Toast message={error} tone="error" /> : null}

            {items.length === 0 ? (
                <EmptyState
                    icon={<BarChart3 color={colors.text.faint} size={36} />}
                    title="No sessions yet"
                    description="Once you finish a workout, it'll show up here with full set details."
                />
            ) : (
                items.map((item) => (
                    <Pressable
                        key={item.sessionId}
                        onPress={() => router.push(
                            `/(app)/workouts/session/${item.sessionId}?workoutId=${item.workoutId}` as any
                        )}
                    >
                        <Card style={styles.card}>
                            <View style={styles.row}>
                                <View style={styles.icon}>
                                    <Trophy color={colors.accent.cyanLight} size={20} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{item.workoutName}</Text>
                                    <Text style={styles.cardMeta} numberOfLines={1}>
                                        {formatRelative(item.finishedAt)} · {formatDuration(item.durationSec)}
                                    </Text>
                                    <View style={styles.chips}>
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText}>{item.totalSets} sets</Text>
                                        </View>
                                        <View style={styles.chip}>
                                            <Text style={styles.chipText}>{Math.round(item.totalVolume)} kg vol</Text>
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight color={colors.text.faint} size={18} />
                            </View>
                        </Card>
                    </Pressable>
                ))
            )}
        </Screen>
    );
}

const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remain = mins % 60;
    return remain ? `${hrs}h ${remain}m` : `${hrs}h`;
};

const formatRelative = (iso: string): string => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
};

const styles = StyleSheet.create({
    header: { marginBottom: spacing.xl },
    title: { ...typography.h1, color: colors.text.primary },
    subtitle: { ...typography.small, color: colors.text.faint, marginTop: 4 },
    card: { marginBottom: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    icon: {
        width: 44, height: 44, borderRadius: radius.sm,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { ...typography.bodyBold, color: colors.text.primary },
    cardMeta: { ...typography.small, color: colors.text.muted, marginTop: 2 },
    chips: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
    chip: {
        backgroundColor: colors.bg.muted,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    chipText: { ...typography.small, color: colors.text.muted, fontSize: 11, fontWeight: '600' },
});