import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User as UserIcon, Ruler, Scale, Activity, Footprints, Bike, Flame,
    Calendar, Clock, Award, ChevronLeft,
} from 'lucide-react-native';

import { PrimaryButton, Toast } from '../../src/components';
import { ProgressBar, StepHeader, SelectCard, Chip } from '../../src/components/onboarding';
import { useAuth } from '../../src/context/AuthContext';
import { ApiRegistry, formatError } from '../../src/services';
import { colors, spacing, radius, typography } from '../../src/theme';

type Gender = 'Male' | 'Female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very';
type Experience = 'beginner' | 'intermediate' | 'advanced';
type SessionDuration = '15-30' | '30-45' | '45-60' | '60+';

interface Answers {
    gender?: Gender;
    age?: string;
    height?: string;
    weight?: string;
    activityLevel?: ActivityLevel;
    weeklyDays?: number;
    sessionDuration?: SessionDuration;
    goals?: string[];
    experience?: Experience;
}

const TOTAL_INPUT_STEPS = 7;

export default function OnboardingScreen() {
    const { user, userId, setUser } = useAuth();
    const api = ApiRegistry.instance;

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const opacity = useRef(new Animated.Value(1)).current;
    const slide = useRef(new Animated.Value(0)).current;

    const goToStep = (next: number) => {
        setError(null);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
            Animated.timing(slide, { toValue: -16, duration: 140, useNativeDriver: true }),
        ]).start(() => {
            setStep(next);
            slide.setValue(16);
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
            ]).start();
        });
    };

    const validate = (): string | null => {
        switch (step) {
            case 1: return answers.gender ? null : 'Please pick your gender to continue.';
            case 2: {
                const n = Number(answers.age);
                return n >= 12 && n <= 100 ? null : 'Enter a valid age (12–100).';
            }
            case 3: {
                const h = Number(answers.height);
                const w = Number(answers.weight);
                if (!(h >= 120 && h <= 230)) return 'Enter a valid height in cm (120–230).';
                if (!(w >= 30 && w <= 250)) return 'Enter a valid weight in kg (30–250).';
                return null;
            }
            case 4: return answers.activityLevel ? null : 'Pick your activity level.';
            case 5:
                if (!answers.weeklyDays) return 'Pick how many days per week.';
                if (!answers.sessionDuration) return 'Pick your typical session length.';
                return null;
            case 6: return answers.goals && answers.goals.length > 0 ? null : 'Pick at least one goal.';
            case 7: return answers.experience ? null : 'Pick your experience level.';
            default: return null;
        }
    };

    const handleNext = () => {
        const err = validate();
        if (err) { setError(err); return; }
        if (step < TOTAL_INPUT_STEPS) goToStep(step + 1);
        else handleFinish();
    };

    const handleBack = () => {
        if (step === 0) return;
        goToStep(step - 1);
    };

    const handleFinish = async () => {
        if (!userId) return;
        setSubmitting(true);
        setError(null);
        try {
            const updated = await api.users.update(userId, {
                profile: {
                    gender: answers.gender,
                    age: Number(answers.age),
                    height: Number(answers.height),
                    weight: Number(answers.weight),
                    activityLevel: answers.activityLevel,
                    weeklyWorkoutDays: answers.weeklyDays,
                    sessionDuration: answers.sessionDuration,
                    goalsList: answers.goals,
                    fitnessGoals: (answers.goals ?? []).join(', '),
                    experienceLevel: answers.experience,
                    onboardingComplete: true,
                },
            });
            setUser(updated);
            // AuthGate notices onboardingComplete=true and routes to dashboard.
            const handleFinish = async () => {
                if (!userId) return;
                setSubmitting(true);
                setError(null);
                try {
                    const updated = await api.users.update(userId, {
                        profile: {
                            // ... your profile data[cite: 1]
                            onboardingComplete: true,
                        },
                    });
                    setUser(updated);

                    // ADD THIS LINE TEMPORARILY:
                    setSubmitting(false);

                    // AuthGate notices onboardingComplete=true and routes to dashboard[cite: 1].
                } catch (e) {
                    setError(formatError(e));
                    setSubmitting(false);
                }
            };
        } catch (e) {
            setError(formatError(e));
            setSubmitting(false);
        }
    };

    const progress = step === 0 ? 0 : Math.min(step / TOTAL_INPUT_STEPS, 1);

    const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
        setAnswers((a) => ({ ...a, [key]: value }));

    const toggleGoal = (goal: string) => setAnswers((a) => {
        const list = a.goals ?? [];
        return { ...a, goals: list.includes(goal) ? list.filter((g) => g !== goal) : [...list, goal] };
    });

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.topBar}>
                    <Pressable
                        onPress={handleBack}
                        disabled={step === 0}
                        style={[styles.backBtn, step === 0 && { opacity: 0 }]}
                        hitSlop={8}
                    >
                        <ChevronLeft color={colors.text.muted} size={22} />
                    </Pressable>
                    <View style={styles.progressContainer}>
                        <ProgressBar progress={progress} />
                    </View>
                    <View style={styles.stepCounter}>
                        {step > 0 && step <= TOTAL_INPUT_STEPS ? (
                            <Text style={styles.stepCounterText}>{step}/{TOTAL_INPUT_STEPS}</Text>
                        ) : null}
                    </View>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity, transform: [{ translateX: slide }], flex: 1 }}>
                        {step === 0 && <WelcomeStep firstName={user?.firstName ?? ''} />}
                        {step === 1 && <GenderStep value={answers.gender} onPick={(v) => set('gender', v)} />}
                        {step === 2 && <AgeStep value={answers.age} onChange={(v) => set('age', v)} />}
                        {step === 3 && (
                            <BodyStep
                                height={answers.height} weight={answers.weight}
                                onChangeHeight={(v) => set('height', v)} onChangeWeight={(v) => set('weight', v)}
                            />
                        )}
                        {step === 4 && <ActivityStep value={answers.activityLevel} onPick={(v) => set('activityLevel', v)} />}
                        {step === 5 && (
                            <CommitmentStep
                                days={answers.weeklyDays} duration={answers.sessionDuration}
                                onPickDays={(v) => set('weeklyDays', v)} onPickDuration={(v) => set('sessionDuration', v)}
                            />
                        )}
                        {step === 6 && <GoalsStep selected={answers.goals ?? []} onToggle={toggleGoal} />}
                        {step === 7 && <ExperienceStep value={answers.experience} onPick={(v) => set('experience', v)} />}

                        {error ? <View style={{ marginTop: spacing.lg }}><Toast message={error} tone="error" /></View> : null}
                    </Animated.View>
                </ScrollView>

                <View style={styles.footer}>
                    <PrimaryButton
                        label={step === 0 ? "Let's begin" : step === TOTAL_INPUT_STEPS ? (submitting ? 'Saving...' : 'Finish') : 'Continue'}
                        onPress={handleNext}
                        loading={submitting}
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const WelcomeStep: React.FC<{ firstName: string }> = ({ firstName }) => (
    <View style={styles.welcome}>
        <View style={styles.heroBadge}>
            <View style={styles.heroDot} />
        </View>
        <Text style={styles.welcomeKicker}>Welcome to GymAnalysis</Text>
        <Text style={styles.welcomeTitle}>{firstName ? `Hi, ${firstName}.` : 'Hi there.'}</Text>
        <Text style={styles.welcomeSubtitle}>
            We need a few details to personalize your training and nutrition. Takes about a minute.
        </Text>
    </View>
);

const GenderStep: React.FC<{ value?: Gender; onPick: (v: Gender) => void }> = ({ value, onPick }) => (
    <View>
        <StepHeader title="What's your gender?" subtitle="Used for accurate calorie and macro estimates." />
        <View style={{ gap: spacing.md }}>
            <SelectCard
                title="Male"
                icon={<UserIcon color={value === 'Male' ? colors.bg.base : colors.text.primary} size={22} />}
                selected={value === 'Male'}
                onPress={() => onPick('Male')}
            />
            <SelectCard
                title="Female"
                icon={<UserIcon color={value === 'Female' ? colors.bg.base : colors.text.primary} size={22} />}
                selected={value === 'Female'}
                onPress={() => onPick('Female')}
            />
        </View>
    </View>
);

const AgeStep: React.FC<{ value?: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
    <View>
        <StepHeader title="How old are you?" subtitle="We tune intensity and recovery to your age." />
        <View style={styles.bigInputWrap}>
            <TextInput
                value={value ?? ''}
                onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.text.veryFaint}
                style={styles.bigInput}
            />
            <Text style={styles.bigInputUnit}>years</Text>
        </View>
    </View>
);

const BodyStep: React.FC<{
    height?: string; weight?: string;
    onChangeHeight: (v: string) => void; onChangeWeight: (v: string) => void;
}> = ({ height, weight, onChangeHeight, onChangeWeight }) => (
    <View>
        <StepHeader title="Your body metrics" subtitle="Required for calorie and macro targets." />
        <View style={styles.metricCard}>
            <View style={styles.metricRow}>
                <Ruler color={colors.accent.cyanLight} size={20} />
                <Text style={styles.metricLabel}>Height</Text>
                <View style={{ flex: 1 }} />
                <TextInput
                    value={height ?? ''}
                    onChangeText={(t) => onChangeHeight(t.replace(/[^0-9.]/g, '').slice(0, 5))}
                    keyboardType="decimal-pad"
                    placeholder="175"
                    placeholderTextColor={colors.text.veryFaint}
                    style={styles.metricInput}
                />
                <Text style={styles.metricUnit}>cm</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricRow}>
                <Scale color={colors.accent.cyanLight} size={20} />
                <Text style={styles.metricLabel}>Weight</Text>
                <View style={{ flex: 1 }} />
                <TextInput
                    value={weight ?? ''}
                    onChangeText={(t) => onChangeWeight(t.replace(/[^0-9.]/g, '').slice(0, 5))}
                    keyboardType="decimal-pad"
                    placeholder="70"
                    placeholderTextColor={colors.text.veryFaint}
                    style={styles.metricInput}
                />
                <Text style={styles.metricUnit}>kg</Text>
            </View>
        </View>
    </View>
);

const ActivityStep: React.FC<{ value?: ActivityLevel; onPick: (v: ActivityLevel) => void }> = ({ value, onPick }) => {
    const opts: { id: ActivityLevel; title: string; desc: string; Icon: React.FC<any> }[] = [
        { id: 'sedentary', title: 'Sedentary', desc: 'Mostly sitting, little exercise', Icon: Activity },
        { id: 'light', title: 'Lightly active', desc: 'Some walking, light chores', Icon: Footprints },
        { id: 'moderate', title: 'Moderately active', desc: 'Active job or daily activity', Icon: Bike },
        { id: 'very', title: 'Very active', desc: 'Physical job, lots of movement', Icon: Flame },
    ];
    return (
        <View>
            <StepHeader title="Day-to-day activity" subtitle="Outside of workouts. Helps estimate daily calorie burn." />
            <View style={{ gap: spacing.md }}>
                {opts.map(({ id, title, desc, Icon }) => (
                    <SelectCard
                        key={id}
                        title={title}
                        description={desc}
                        icon={<Icon color={value === id ? colors.bg.base : colors.text.primary} size={22} />}
                        selected={value === id}
                        onPress={() => onPick(id)}
                    />
                ))}
            </View>
        </View>
    );
};

const CommitmentStep: React.FC<{
    days?: number; duration?: SessionDuration;
    onPickDays: (v: number) => void; onPickDuration: (v: SessionDuration) => void;
}> = ({ days, duration, onPickDays, onPickDuration }) => (
    <View>
        <StepHeader title="Weekly commitment" subtitle="We'll build plans that fit your schedule." />

        <View style={styles.subsection}>
            <View style={styles.subsectionHeader}>
                <Calendar color={colors.accent.cyanLight} size={18} />
                <Text style={styles.subsectionTitle}>Days per week</Text>
            </View>
            <View style={styles.chipsRow}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <Chip key={d} label={String(d)} selected={days === d} onPress={() => onPickDays(d)} />
                ))}
            </View>
        </View>

        <View style={styles.subsection}>
            <View style={styles.subsectionHeader}>
                <Clock color={colors.accent.cyanLight} size={18} />
                <Text style={styles.subsectionTitle}>Session length</Text>
            </View>
            <View style={styles.chipsRow}>
                {(['15-30', '30-45', '45-60', '60+'] as const).map((d) => (
                    <Chip key={d} label={`${d} min`} selected={duration === d} onPress={() => onPickDuration(d)} />
                ))}
            </View>
        </View>
    </View>
);

const GOALS = ['Build muscle', 'Lose fat', 'Get stronger', 'Improve endurance', 'Mobility', 'General health'];
const GoalsStep: React.FC<{ selected: string[]; onToggle: (g: string) => void }> = ({ selected, onToggle }) => (
    <View>
        <StepHeader title="What are your goals?" subtitle="Pick all that apply. We'll prioritize accordingly." />
        <View style={styles.chipsRow}>
            {GOALS.map((g) => (
                <Chip key={g} label={g} selected={selected.includes(g)} onPress={() => onToggle(g)} />
            ))}
        </View>
    </View>
);

const ExperienceStep: React.FC<{ value?: Experience; onPick: (v: Experience) => void }> = ({ value, onPick }) => {
    const opts: { id: Experience; title: string; desc: string }[] = [
        { id: 'beginner', title: 'Beginner', desc: 'New to structured training' },
        { id: 'intermediate', title: 'Intermediate', desc: '6+ months of consistent training' },
        { id: 'advanced', title: 'Advanced', desc: '2+ years, deep technique knowledge' },
    ];
    return (
        <View>
            <StepHeader title="Training experience" subtitle="So we calibrate intensity and exercise selection." />
            <View style={{ gap: spacing.md }}>
                {opts.map(({ id, title, desc }) => (
                    <SelectCard
                        key={id}
                        title={title}
                        description={desc}
                        icon={<Award color={value === id ? colors.bg.base : colors.text.primary} size={22} />}
                        selected={value === id}
                        onPress={() => onPick(id)}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg.base },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backBtn: { padding: spacing.xs },
    progressContainer: { flex: 1 },
    stepCounter: { width: 36, alignItems: 'flex-end' },
    stepCounterText: { ...typography.small, color: colors.text.muted, fontWeight: '700' },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl2,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.bg.base,
        borderTopWidth: 1,
        borderTopColor: colors.border.muted,
    },
    welcome: { alignItems: 'center', paddingTop: spacing.xl3 },
    heroBadge: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    heroDot: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.accent.cyan,
    },
    welcomeKicker: {
        ...typography.label,
        color: colors.accent.cyanLight,
        marginBottom: spacing.md,
    },
    welcomeTitle: {
        ...typography.display,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    welcomeSubtitle: {
        ...typography.body,
        color: colors.text.muted,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    bigInputWrap: { alignItems: 'center', paddingVertical: spacing.xl3 },
    bigInput: {
        fontSize: 88,
        fontWeight: '900',
        color: colors.text.primary,
        textAlign: 'center',
        minWidth: 160,
        padding: 0,
    },
    bigInputUnit: {
        ...typography.label,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
    metricCard: {
        backgroundColor: colors.bg.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: spacing.xl,
    },
    metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    metricLabel: { ...typography.bodyBold, color: colors.text.primary },
    metricInput: {
        ...typography.h2,
        color: colors.text.primary,
        textAlign: 'right',
        minWidth: 80,
        padding: 0,
    },
    metricUnit: { ...typography.bodyBold, color: colors.text.muted, width: 30, textAlign: 'right' },
    metricDivider: {
        height: 1,
        backgroundColor: colors.border.muted,
        marginVertical: spacing.lg,
    },
    subsection: { marginBottom: spacing.xl2 },
    subsectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    subsectionTitle: { ...typography.label, color: colors.text.muted },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
});