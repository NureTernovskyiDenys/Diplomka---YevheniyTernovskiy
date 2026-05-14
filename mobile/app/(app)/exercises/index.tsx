import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react-native';

import { Screen, Card, TextField, Loader, EmptyState, Toast, ScreenHeader, Badge, BackButton } from '../../../src/components';
import { Exercise } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { colors, spacing, typography, radius } from '../../../src/theme';

const PAGE_SIZE = 30;

export default function ExercisesListScreen() {
    const router = useRouter();
    const { fromWorkout } = useLocalSearchParams<{ fromWorkout?: string }>();
    const api = ApiRegistry.instance;

    const [items, setItems] = useState<Exercise[]>([]);
    const [search, setSearch] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingId, setAddingId] = useState<string | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setActiveQuery(search.trim());
            setOffset(0);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setError(null);
        try {
            const list = activeQuery
                ? await api.exercises.search(activeQuery, offset, PAGE_SIZE)
                : await api.exercises.list(offset, PAGE_SIZE);
            setItems(list);
        } catch (e) {
            setError(formatError(e));
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, activeQuery, offset]);

    useEffect(() => { load(); }, [load]);

    const handleExercisePress = async (exerciseId: string) => {
        // Pick mode: came from a workout, tap directly adds and returns.
        if (fromWorkout) {
            setAddingId(exerciseId);
            try {
                await api.workouts.addExercise(fromWorkout, exerciseId);
                router.replace(`/(app)/workouts/${fromWorkout}` as any);
            } catch (e) {
                setError(formatError(e));
                setAddingId(null);
            }
            return;
        }
        // Browse mode: normal navigation to detail.
        router.push(`/(app)/exercises/${exerciseId}` as any);
    };

    return (
        <Screen scroll={false}>
            <View style={styles.padding}>
                {fromWorkout ? <BackButton label="Back to workout" /> : null}

                <ScreenHeader
                    title={fromWorkout ? 'Pick exercise' : 'Library'}
                    subtitle={fromWorkout
                        ? 'Tap any exercise to add it to your workout.'
                        : 'Browse our entire database of moves.'}
                />

                <Card style={{ marginBottom: spacing.lg }}>
                    <TextField
                        placeholder="Search by name, target, equipment..."
                        value={search}
                        onChangeText={setSearch}
                        leftIcon={<Search color={colors.text.faint} size={18} />}
                    />
                </Card>

                <View style={styles.pagerRow}>
                    <Text style={styles.pagerLabel}>
                        {activeQuery ? `"${activeQuery}"` : 'Global Directory'} • {offset + 1} – {offset + items.length}
                    </Text>
                    <View style={styles.pagerControls}>
                        <Pressable
                            onPress={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                            disabled={offset === 0}
                            style={[styles.pagerBtn, offset === 0 && styles.pagerBtnDisabled]}
                        >
                            <ChevronLeft color={colors.text.muted} size={18} />
                        </Pressable>
                        <Pressable
                            onPress={() => setOffset(offset + PAGE_SIZE)}
                            disabled={items.length < PAGE_SIZE}
                            style={[styles.pagerBtn, items.length < PAGE_SIZE && styles.pagerBtnDisabled]}
                        >
                            <ChevronRight color={colors.text.muted} size={18} />
                        </Pressable>
                    </View>
                </View>

                {error ? <Toast message={error} tone="error" /> : null}
            </View>

            {loading ? (
                <Loader fullScreen label="Syncing Database..." />
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={items}
                    keyExtractor={(e) => e.id}
                    contentContainerStyle={styles.list}
                    onRefresh={() => { setRefreshing(true); load(); }}
                    refreshing={refreshing}
                    ListEmptyComponent={(
                        <View style={styles.padding}>
                            <EmptyState
                                icon={<Dumbbell color={colors.text.faint} size={36} />}
                                title="No exercises found"
                                description="Try a different keyword or scroll back a page."
                            />
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <ExerciseRow
                            item={item}
                            onPress={() => handleExercisePress(item.id)}
                            adding={addingId === item.id}
                            pickMode={!!fromWorkout}
                        />
                    )}
                />
            )}
        </Screen>
    );
}

const ExerciseRow: React.FC<{
    item: Exercise;
    onPress: () => void;
    adding: boolean;
    pickMode: boolean;
}> = ({ item, onPress, adding, pickMode }) => (
    <Card onPress={onPress} style={styles.row} padded={false}>
        <View style={styles.rowInner}>
            <View style={styles.thumb}>
                {item.gifUrl ? (
                    <Image source={{ uri: item.gifUrl }} style={styles.thumbImg} resizeMode="cover" />
                ) : (
                    <Dumbbell color={colors.text.faint} size={22} />
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.rowMeta} numberOfLines={1}>{item.primaryTarget} • {item.equipmentLabel}</Text>
                {item.bodyParts.length > 0 ? (
                    <View style={styles.rowBadges}>
                        {item.bodyParts.slice(0, 2).map((bp) => (
                            <Badge key={bp} tone="indigo" label={bp} />
                        ))}
                    </View>
                ) : null}
            </View>
            {pickMode ? (
                <View style={[styles.addCircle, adding && styles.addCircleBusy]}>
                    <Plus color={adding ? colors.text.faint : colors.accent.cyanLight} size={18} strokeWidth={3} />
                </View>
            ) : null}
        </View>
    </Card>
);

const styles = StyleSheet.create({
    padding: { paddingHorizontal: spacing.xl },
    pagerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    pagerLabel: {
        ...typography.label,
        color: colors.text.muted,
    },
    pagerControls: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    pagerBtn: {
        width: 36,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagerBtnDisabled: {
        opacity: 0.4,
    },
    list: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl4,
        gap: spacing.md,
    },
    row: {},
    rowInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
    },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: radius.md,
        backgroundColor: colors.bg.muted,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.muted,
        overflow: 'hidden',
    },
    thumbImg: {
        width: '100%',
        height: '100%',
    },
    rowTitle: {
        ...typography.bodyBold,
        color: colors.text.primary,
        textTransform: 'capitalize',
    },
    rowMeta: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
        textTransform: 'capitalize',
    },
    rowBadges: {
        flexDirection: 'row',
        gap: 4,
        marginTop: spacing.sm,
    },
    addCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accent.cyanSoft,
        borderWidth: 1,
        borderColor: colors.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCircleBusy: {
        opacity: 0.5,
    },
});