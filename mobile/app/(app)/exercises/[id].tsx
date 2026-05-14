import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, Modal, Pressable, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus, Save, Target, ListOrdered, X, Loader2 } from 'lucide-react-native';

import { Screen, Card, PrimaryButton, Loader, Badge, Toast, EmptyState, TextField, BackButton } from '../../../src/components';
import { Exercise, Workout } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function ExerciseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const api = ApiRegistry.instance;

    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const ex = await api.exercises.byId(id);
            setExercise(ex);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api, id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Loader fullScreen label="Loading exercise..." />;
    if (error || !exercise) {
        return (
            <Screen>
                <BackButton />
                <Toast message={error ?? 'Not found'} tone="error" />
            </Screen>
        );
    }

    return (
        <Screen scroll>
            <BackButton />

            <Card style={{ marginBottom: spacing.lg, padding: 0, overflow: 'hidden' }} padded={false}>
                <View style={styles.gifWrap}>
                    {exercise.gifUrl ? (
                        <Image source={{ uri: exercise.gifUrl }} resizeMode="contain" style={styles.gif} />
                    ) : (
                        <View style={styles.gifPlaceholder}>
                            <Text style={styles.gifPlaceholderText}>No preview</Text>
                        </View>
                    )}
                </View>
            </Card>

            <Text style={styles.title}>{exercise.name}</Text>

            <PrimaryButton
                label="Add to Collection"
                icon={<Plus color={colors.bg.base} size={18} />}
                onPress={() => setPickerOpen(true)}
                style={{ marginBottom: spacing.xl }}
            />

            <View style={styles.matrix}>
                <Card accent="cyan" style={styles.matrixCol}>
                    <View style={styles.matrixHeader}>
                        <Target color={colors.accent.cyanLight} size={16} />
                        <Text style={[styles.matrixLabel, { color: colors.accent.cyanLight }]}>Target</Text>
                    </View>
                    <View style={styles.tagRow}>
                        {exercise.targetMuscles.length === 0
                            ? <Text style={styles.faintText}>Unknown</Text>
                            : exercise.targetMuscles.map((m) => <Badge key={m} tone="cyan" label={m} />)}
                    </View>
                </Card>
                <Card style={styles.matrixCol}>
                    <View style={styles.matrixHeader}>
                        <ListOrdered color={colors.text.muted} size={16} />
                        <Text style={[styles.matrixLabel, { color: colors.text.muted }]}>Secondary</Text>
                    </View>
                    <View style={styles.tagRow}>
                        {exercise.secondaryMuscles.length === 0
                            ? <Text style={styles.faintText}>None</Text>
                            : exercise.secondaryMuscles.map((m) => <Badge key={m} tone="neutral" label={m} />)}
                    </View>
                </Card>
            </View>

            {(exercise.equipments.length > 0 || exercise.bodyParts.length > 0) && (
                <Card style={{ marginBottom: spacing.lg }}>
                    {exercise.equipments.length > 0 ? (
                        <View style={styles.metaBlock}>
                            <Text style={styles.metaTitle}>Equipment</Text>
                            <View style={styles.tagRow}>
                                {exercise.equipments.map((e) => <Badge key={e} tone="neutral" label={e} />)}
                            </View>
                        </View>
                    ) : null}
                    {exercise.bodyParts.length > 0 ? (
                        <View style={[styles.metaBlock, { marginBottom: 0 }]}>
                            <Text style={styles.metaTitle}>Body Parts</Text>
                            <View style={styles.tagRow}>
                                {exercise.bodyParts.map((b) => <Badge key={b} tone="indigo" label={b} />)}
                            </View>
                        </View>
                    ) : null}
                </Card>
            )}

            {exercise.instructions.length > 0 ? (
                <View>
                    <Text style={styles.sectionTitle}>Execution Guide</Text>
                    {exercise.instructions.map((step, idx) => (
                        <Card key={idx} style={{ marginBottom: spacing.md }} padded={false}>
                            <View style={styles.stepRow}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        </Card>
                    ))}
                </View>
            ) : null}

            <AddToWorkoutModal
                visible={pickerOpen}
                onClose={() => setPickerOpen(false)}
                exerciseId={exercise.id}
            />
        </Screen>
    );
}

const AddToWorkoutModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    exerciseId: string;
}> = ({ visible, onClose, exerciseId }) => {
    const api = ApiRegistry.instance;
    const [list, setList] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) return;
        setError(null);
        setLoading(true);
        api.workouts.listMine()
            .then(setList)
            .catch((e) => setError(formatError(e)))
            .finally(() => setLoading(false));
    }, [visible, api]);

    const addTo = async (workoutId: string) => {
        setSavingId(workoutId);
        try {
            await api.workouts.addExercise(workoutId, exerciseId);
            onClose();
        } catch (e) {
            setError(formatError(e));
        } finally {
            setSavingId(null);
        }
    };

    const createAndAdd = async () => {
        if (!newName.trim()) return;
        setSavingId('new');
        try {
            const w = await api.workouts.create({ name: newName.trim() });
            await api.workouts.addExercise(w.id, exerciseId);
            setNewName('');
            onClose();
        } catch (e) {
            setError(formatError(e));
        } finally {
            setSavingId(null);
        }
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add to Workout</Text>
                        <Pressable onPress={onClose} hitSlop={10}><X color={colors.text.muted} size={22} /></Pressable>
                    </View>
                    {error ? <Toast message={error} tone="error" /> : null}
                    {loading ? (
                        <Loader label="Loading workouts..." />
                    ) : list.length === 0 ? (
                        <EmptyState
                            title="No workouts yet"
                            description="Create one below."
                        />
                    ) : (
                        <FlatList
                            data={list}
                            keyExtractor={(w) => w.id}
                            style={{ maxHeight: 280 }}
                            contentContainerStyle={{ gap: spacing.sm }}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => addTo(item.id)}
                                    disabled={!!savingId}
                                    style={({ pressed }) => [styles.pickRow, pressed && { opacity: 0.7 }]}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pickRowTitle}>{item.name}</Text>
                                        <Text style={styles.pickRowMeta}>{item.exerciseCount} exercises</Text>
                                    </View>
                                    {savingId === item.id ? (
                                        <Loader2 color={colors.accent.cyanLight} size={18} />
                                    ) : (
                                        <Plus color={colors.accent.cyanLight} size={18} />
                                    )}
                                </Pressable>
                            )}
                        />
                    )}

                    <View style={styles.createBlock}>
                        <Text style={styles.label}>Or create a new routine</Text>
                        <View style={styles.createRow}>
                            <View style={{ flex: 1 }}>
                                <TextField
                                    placeholder="e.g. Push Day"
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                            </View>
                            <Pressable
                                onPress={createAndAdd}
                                disabled={!newName.trim() || savingId === 'new'}
                                style={({ pressed }) => [
                                    styles.createBtn,
                                    (!newName.trim() || savingId === 'new') && { opacity: 0.5 },
                                    pressed && { opacity: 0.8 },
                                ]}
                            >
                                {savingId === 'new' ? <Loader2 color={colors.bg.base} size={18} /> : <Save color={colors.bg.base} size={18} />}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    gifWrap: {
        aspectRatio: 1.05,
        backgroundColor: colors.bg.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gif: {
        width: '100%',
        height: '100%',
    },
    gifPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gifPlaceholderText: {
        ...typography.body,
        color: colors.text.faint,
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
        marginBottom: spacing.lg,
        textTransform: 'capitalize',
    },
    matrix: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    matrixCol: {},
    matrixHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    matrixLabel: {
        ...typography.label,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    faintText: {
        ...typography.small,
        color: colors.text.faint,
        fontStyle: 'italic',
    },
    metaBlock: {
        marginBottom: spacing.md,
    },
    metaTitle: {
        ...typography.label,
        color: colors.text.muted,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        ...typography.h2,
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    stepRow: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.accent.cyanSoft,
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        ...typography.bodyBold,
        color: colors.accent.cyanLight,
    },
    stepText: {
        flex: 1,
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 22,
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
        gap: spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        ...typography.h2,
        color: colors.text.primary,
    },
    pickRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.muted,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    pickRowTitle: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    pickRowMeta: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
    },
    createBlock: {
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    label: {
        ...typography.label,
        color: colors.text.muted,
    },
    createRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    createBtn: {
        width: 50,
        height: 50,
        borderRadius: radius.md,
        backgroundColor: colors.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
