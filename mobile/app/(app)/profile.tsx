import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Save, LogOut, Scale, Ruler, User as UserIcon, Activity, Target, Flame, Sparkles,
} from 'lucide-react-native';

import { Screen, Card, TextField, PrimaryButton, Loader, Toast, ScreenHeader, Badge } from '../../src/components';
import { Gender } from '../../src/models/User';
import { SubscriptionPlan } from '../../src/models';
import { ApiRegistry, formatError } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, userId, logout, refreshUser, setUser } = useAuth();
    const api = ApiRegistry.instance;

    const [loading, setLoading] = useState(!user);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedToast, setSavedToast] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>('Male');
    const [illnesses, setIllnesses] = useState('');
    const [goals, setGoals] = useState('');

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

    useEffect(() => {
        api.subscriptions.list()
            .then((list) => setPlans(list))
            .catch(() => setPlans([]));
    }, [api]);

    const currentPlanName = (() => {
        if (!user?.hasActiveSubscription) return null;
        const planId = user.subscription?.planId;
        if (!planId) return null;
        const plan = plans.find((p) => p.id === planId);
        return plan?.name ?? null;
    })();

    useEffect(() => {
        if (!user) return;
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        setWeight(user.profile.weight?.toString() ?? '');
        setHeight(user.profile.height?.toString() ?? '');
        setAge(user.profile.age?.toString() ?? '');
        setGender(user.profile.gender ?? 'Male');
        setIllnesses(user.profile.illnesses ?? '');
        setGoals(user.profile.fitnessGoals ?? '');
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user && userId) {
            refreshUser().finally(() => setLoading(false));
        }
        // load on first mount only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSave = async () => {
        if (!userId) return;
        setSaving(true);
        setError(null);
        try {
            const updated = await api.users.update(userId, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                profile: {
                    ...(user?.profile ?? {}),
                    weight: weight ? parseFloat(weight) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    age: age ? parseInt(age, 10) : undefined,
                    gender,
                    illnesses: illnesses.trim() || undefined,
                    fitnessGoals: goals.trim() || undefined,
                },
            });
            setUser(updated);
            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 2500);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader fullScreen label="Loading profile..." />;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Screen scroll>
                <ScreenHeader
                    title="Profile"
                    subtitle={user?.email}
                    rightAction={
                        <Pressable onPress={async () => { await logout(); router.replace('/(auth)/login'); }} hitSlop={8} style={styles.logout}>
                            <LogOut color={colors.danger.light} size={18} />
                        </Pressable>
                    }
                />

                {savedToast ? <Toast message="Profile saved." tone="success" /> : null}
                {error ? <Toast message={error} tone="error" /> : null}

                <Card style={styles.heroCard}>
                    <View style={styles.heroRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.initials ?? '?'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.heroName}>{user?.fullName ?? 'Athlete'}</Text>
                            <Text style={styles.heroEmail}>{user?.email}</Text>
                            <View style={{ marginTop: spacing.xs }}>
                                <Badge
                                    tone={user?.hasActiveSubscription ? 'emerald' : 'amber'}
                                    label={
                                        user?.hasActiveSubscription
                                            ? `${currentPlanName ?? 'Premium'} Active`
                                            : 'Free Tier'
                                    }
                                    icon={<Sparkles color={user?.hasActiveSubscription ? colors.emerald.light : colors.amber.light} size={10} />}
                                />
                            </View>
                        </View>
                    </View>
                    <Pressable onPress={() => router.push('/(app)/subscriptions' as any)} style={styles.subLink}>
                        <Text style={styles.subLinkText}>Manage Subscription →</Text>
                    </Pressable>
                </Card>

                {user?.hasNutritionTargets ? (
                    <Card style={{ marginBottom: spacing.lg }}>
                        <View style={styles.macroHeader}>
                            <Flame color={colors.amber.base} size={18} />
                            <Text style={styles.macroHeaderText}>Daily Targets</Text>
                            {user.profile.macroDietName ? (
                                <Badge tone="indigo" label={user.profile.macroDietName} />
                            ) : null}
                        </View>

                        <View style={styles.kcalRow}>
                            <View style={styles.kcalBubble}>
                                <Text style={styles.kcalValue}>{user.profile.targetCalories}</Text>
                                <Text style={styles.kcalUnit}>kcal / day</Text>
                            </View>
                        </View>

                        <View style={styles.macroSplit}>
                            <MacroBox label="Protein" value={user.profile.targetProtein!} unit="g" tone="indigo" />
                            <MacroBox label="Carbs" value={user.profile.targetCarbs!} unit="g" tone="emerald" />
                            <MacroBox label="Fat" value={user.profile.targetFat!} unit="g" tone="amber" />
                        </View>
                    </Card>
                ) : null}

                <Card style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.sectionLabel}>Basic Info</Text>
                    <View style={styles.row}>
                        <TextField label="First Name" value={firstName} onChangeText={setFirstName} style={{ flex: 1 }} />
                        <TextField label="Last Name" value={lastName} onChangeText={setLastName} style={{ flex: 1 }} />
                    </View>
                </Card>

                <Card style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.sectionLabel}>Physical Metrics</Text>
                    <View style={styles.row}>
                        <TextField
                            label="Weight (kg)"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            leftIcon={<Scale color={colors.text.faint} size={16} />}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            label="Height (cm)"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                            leftIcon={<Ruler color={colors.text.faint} size={16} />}
                            style={{ flex: 1 }}
                        />
                    </View>
                    <View style={[styles.row, { marginTop: spacing.lg }]}>
                        <TextField
                            label="Age"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                            leftIcon={<UserIcon color={colors.text.faint} size={16} />}
                            style={{ flex: 1 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <View style={styles.segmented}>
                                {(['Male', 'Female'] as Gender[]).map((g) => (
                                    <Pressable
                                        key={g}
                                        onPress={() => setGender(g)}
                                        style={[styles.segment, gender === g && styles.segmentActive]}
                                    >
                                        <Text style={[styles.segmentLabel, gender === g && styles.segmentLabelActive]}>{g}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                </Card>

                <Card style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.sectionLabel}>Health Context</Text>
                    <TextField
                        label="Illnesses & Injuries"
                        placeholder="e.g. Lower back pain, asthma"
                        multiline
                        leftIcon={<Activity color={colors.rose.light} size={16} />}
                        value={illnesses}
                        onChangeText={setIllnesses}
                        hint="The AI coach uses this to flag risky exercises."
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Primary Fitness Goals"
                        placeholder="e.g. Lose body fat while keeping strength"
                        multiline
                        leftIcon={<Target color={colors.accent.cyanLight} size={16} />}
                        value={goals}
                        onChangeText={setGoals}
                    />
                </Card>

                <PrimaryButton
                    label={saving ? 'Saving...' : 'Save Profile'}
                    icon={<Save color={colors.bg.base} size={18} />}
                    onPress={onSave}
                    loading={saving}
                    size="lg"
                />
            </Screen>
        </KeyboardAvoidingView>
    );
}

const MacroBox: React.FC<{ label: string; value: number; unit: string; tone: 'indigo' | 'emerald' | 'amber' }> = ({ label, value, unit, tone }) => {
    const tint = tone === 'indigo' ? colors.indigo.light : tone === 'emerald' ? colors.emerald.light : colors.amber.light;
    return (
        <View style={styles.macroBox}>
            <Text style={[styles.macroBoxLabel, { color: tint }]}>{label}</Text>
            <View style={styles.macroBoxValueRow}>
                <Text style={styles.macroBoxValue}>{value}</Text>
                <Text style={styles.macroBoxUnit}>{unit}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    logout: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.danger.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCard: {
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.accent.cyanSoft,
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...typography.h2,
        color: colors.accent.cyanLight,
    },
    heroName: {
        ...typography.h2,
        color: colors.text.primary,
    },
    heroEmail: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
    },
    subLink: {
        marginTop: spacing.sm,
    },
    subLinkText: {
        ...typography.small,
        color: colors.accent.cyanLight,
        fontWeight: '700',
    },
    macroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    macroHeaderText: {
        ...typography.h3,
        color: colors.text.primary,
        flex: 1,
    },
    kcalRow: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.bg.muted,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accent.cyan,
        marginBottom: spacing.md,
    },
    kcalBubble: {
        alignItems: 'center',
    },
    kcalValue: {
        ...typography.display,
        fontSize: 40,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
        lineHeight: 44,
    },
    kcalUnit: {
        ...typography.small,
        color: colors.accent.cyanLight,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        fontSize: 11,
        marginTop: 2,
    },
    macroSplit: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    macroBox: {
        flex: 1,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.muted,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    macroBoxLabel: {
        ...typography.small,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    macroBoxValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
    },
    macroBoxValue: {
        ...typography.h3,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    macroBoxUnit: {
        ...typography.small,
        color: colors.text.faint,
        fontWeight: '600',
        fontSize: 11,
        marginLeft: 1,
    },
    sectionLabel: {
        ...typography.label,
        color: colors.text.muted,
        marginBottom: spacing.lg,
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
});