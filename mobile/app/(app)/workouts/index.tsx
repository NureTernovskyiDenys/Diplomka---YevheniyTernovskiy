import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Dumbbell, Plus, X, User as UserIcon, ListChecks, Loader2 } from 'lucide-react-native';

import { Screen, Card, TextField, PrimaryButton, EmptyState, Loader, Toast, Badge, ScreenHeader } from '../../../src/components';
import { Workout } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function WorkoutsListScreen() {
    const router = useRouter();
    const { userId } = useAuth();
    const api = ApiRegistry.instance;

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [search, setSearch] = useState('');
    const [filterMine, setFilterMine] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const load = useCallback(async () => {
        if (!userId) return;
        setError(null);
        try {
            const list = search.trim() || filterMine
                ? await api.workouts.listPublic(search.trim() || undefined, filterMine ? userId : undefined)
                : await api.workouts.listMine();
            setWorkouts(list);
        } catch (e) {
            setError(formatError(e));
            setWorkouts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, search, filterMine, userId]);

    useEffect(() => {
        const t = setTimeout(() => load(), 300);
        return () => clearTimeout(t);
    }, [load]);

    const handleCreate = async (name: string) => {
        const w = await api.workouts.create({ name });
        setCreateOpen(false);
        router.push(`/(app)/workouts/${w.id}`);
    };

    return (
        <Screen scroll={false}>
            <View style={styles.padding}>
                <ScreenHeader
                    title="Workouts"
                    subtitle="Build, browse, and train your routines."
                    rightAction={
                        <Pressable
                            onPress={() => setCreateOpen(true)}
                            hitSlop={8}
                            style={({ pressed }) => [styles.fab, pressed && { opacity: 0.7 }]}
                        >
                            <Plus color={colors.bg.base} size={22} />
                        </Pressable>
                    }
                />

                <Card style={{ marginBottom: spacing.lg }}>
                    <TextField
                        placeholder="Search workout plans..."
                        value={search}
                        onChangeText={setSearch}
                        leftIcon={<Search color={colors.text.faint} size={18} />}
                        style={{ marginBottom: spacing.md }}
                    />
                    <View style={styles.toggleRow}>
                        <Pressable onPress={() => setFilterMine(!filterMine)} style={styles.toggle}>
                            <View style={[styles.toggleTrack, filterMine && styles.toggleTrackOn]}>
                                <View style={[styles.toggleThumb, filterMine && styles.toggleThumbOn]} />
                            </View>
                            <Text style={[styles.toggleLabel, filterMine && styles.toggleLabelOn]}>
                                Created by me
                            </Text>
                        </Pressable>
                    </View>
                </Card>

                {error ? <Toast message={error} tone="error" /> : null}
            </View>

            {loading ? (
                <Loader fullScreen label="Scanning Data..." />
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(w) => w.id}
                    contentContainerStyle={styles.list}
                    onRefresh={() => { setRefreshing(true); load(); }}
                    refreshing={refreshing}
                    ListEmptyComponent={(
                        <View style={styles.padding}>
                            <EmptyState
                                icon={<ListChecks color={colors.text.faint} size={40} />}
                                title="No Workouts Found"
                                description={filterMine
                                    ? "You haven't created any workouts yet. Tap + to start one."
                                    : 'No community workouts match your search.'}
                            />
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <Card
                            onPress={() => router.push(`/(app)/workouts/${item.id}` as any)}
                            style={styles.itemCard}
                        >
                            <View style={styles.itemHeader}>
                                <View style={styles.itemIcon}>
                                    <ListChecks color={colors.accent.cyanLight} size={22} />
                                </View>
                                <Badge tone="neutral" label={item.createdAt?.toLocaleDateString() ?? ''} />
                            </View>
                            <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
                            <View style={styles.itemMetaRow}>
                                <UserIcon color={colors.text.faint} size={14} />
                                <Text style={styles.itemMetaText}>{item.authorName}</Text>
                            </View>
                            <View style={styles.itemFooter}>
                                <Dumbbell color={colors.text.muted} size={14} />
                                <Text style={styles.itemFooterText}>{item.exerciseCount} exercises</Text>
                            </View>
                        </Card>
                    )}
                />
            )}

            <CreateWorkoutModal
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={handleCreate}
            />
        </Screen>
    );
}

const CreateWorkoutModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string) => Promise<void>;
}> = ({ visible, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) { setName(''); setError(null); }
    }, [visible]);

    const submit = async () => {
        if (!name.trim()) { setError('Give your workout a name first.'); return; }
        setSaving(true);
        try {
            await onCreate(name.trim());
        } catch (e) {
            setError(formatError(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Workout</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <X color={colors.text.muted} size={22} />
                        </Pressable>
                    </View>
                    <Text style={styles.modalDesc}>Add exercises after creating it.</Text>
                    {error ? <Toast message={error} tone="error" /> : null}
                    <TextField
                        label="Workout Name"
                        placeholder="e.g. Push Day"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        style={{ marginBottom: spacing.xl }}
                    />
                    <PrimaryButton label="Create" onPress={submit} loading={saving} size="lg" />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    padding: { paddingHorizontal: spacing.xl },
    fab: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.bg.surfaceAlt,
        padding: 2,
    },
    toggleTrackOn: {
        backgroundColor: colors.accent.cyan,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
    },
    toggleThumbOn: {
        transform: [{ translateX: 20 }],
    },
    toggleLabel: {
        ...typography.bodyBold,
        color: colors.text.muted,
    },
    toggleLabelOn: {
        color: colors.accent.cyanLight,
    },
    list: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl4,
        gap: spacing.md,
    },
    itemCard: {},
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    itemMetaText: {
        ...typography.small,
        color: colors.text.faint,
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.muted,
    },
    itemFooterText: {
        ...typography.small,
        color: colors.text.muted,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: colors.bg.surface,
        borderTopLeftRadius: radius.xl2,
        borderTopRightRadius: radius.xl2,
        padding: spacing.xl2,
        paddingBottom: spacing.xl3,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text.primary,
    },
    modalDesc: {
        ...typography.small,
        color: colors.text.faint,
        marginBottom: spacing.xl,
    },
});
