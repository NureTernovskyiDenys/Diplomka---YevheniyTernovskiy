import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Dumbbell, TrendingUp, Sparkles, BookOpen, Flame, Calculator,
    BarChart3, Zap, ArrowRight,
} from 'lucide-react-native';

import { Screen, Card } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../src/theme';

interface QuickAction {
    title: string;
    description: string;
    icon: React.ReactNode;
    accent: 'cyan' | 'indigo' | 'rose' | 'emerald' | 'amber';
    route: string;
}

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const greeting = user?.firstName?.trim() ? user.firstName : 'Athlete';

    const primaryActions: QuickAction[] = [
        {
            title: 'My Workouts',
            description: 'Saved routines + community plans',
            icon: <Dumbbell color={colors.accent.cyanLight} size={28} />,
            accent: 'cyan',
            route: '/(app)/workouts',
        },
        {
            title: 'Exercise Library',
            description: 'Search 1300+ moves by target',
            icon: <BookOpen color={colors.indigo.light} size={28} />,
            accent: 'indigo',
            route: '/(app)/exercises',
        },
    ];

    const tools: QuickAction[] = [
        {
            title: 'Calorie Calc',
            description: 'Daily TDEE',
            icon: <Flame color={colors.amber.base} size={20} />,
            accent: 'amber',
            route: '/(app)/tools/calories',
        },
        {
            title: 'Macro Splitter',
            description: 'Diet breakdown',
            icon: <Calculator color={colors.indigo.light} size={20} />,
            accent: 'indigo',
            route: '/(app)/tools/macros',
        },
        {
            title: 'One-Rep Max',
            description: 'Strength zones',
            icon: <Zap color={colors.rose.light} size={20} />,
            accent: 'rose',
            route: '/(app)/tools/onerepmax',
        },
    ];

    return (
        <Screen scroll>
            <View style={styles.heroBlock}>
                <Text style={styles.welcome}>
                    Welcome back, <Text style={styles.welcomeAccent}>{greeting}</Text>
                </Text>
                <Text style={styles.subline}>Ready to crush your goals today? Let's get to work.</Text>
            </View>

            <View style={styles.grid}>
                {primaryActions.map((a) => (
                    <Card
                        key={a.title}
                        onPress={() => router.push(a.route as any)}
                        accent={a.accent}
                        style={styles.bigCard}
                    >
                        <View style={[styles.iconBubble, { backgroundColor: tintFor(a.accent) }]}>{a.icon}</View>
                        <Text style={styles.bigCardTitle}>{a.title}</Text>
                        <Text style={styles.bigCardDesc}>{a.description}</Text>
                        <View style={styles.bigCardFooter}>
                            <Text style={[styles.bigCardCta, { color: accentText(a.accent) }]}>Open</Text>
                            <ArrowRight color={accentText(a.accent)} size={18} />
                        </View>
                    </Card>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Tools</Text>
                <View style={styles.toolsRow}>
                    {tools.map((t) => (
                        <Card
                            key={t.title}
                            onPress={() => router.push(t.route as any)}
                            style={styles.toolCard}
                            padded={false}
                        >
                            <View style={styles.toolInner}>
                                <View style={[styles.toolIcon, { backgroundColor: tintFor(t.accent) }]}>
                                    {t.icon}
                                </View>
                                <Text style={styles.toolTitle}>{t.title}</Text>
                                <Text style={styles.toolDesc}>{t.description}</Text>
                            </View>
                        </Card>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Pressable onPress={() => router.push('/(app)/blog' as any)}>
                    <Card style={styles.blogTeaser}>
                        <View style={styles.blogTeaserRow}>
                            <View style={[styles.iconBubble, { backgroundColor: colors.accent.cyanSoft }]}>
                                <BookOpen color={colors.accent.cyanLight} size={22} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.bigCardTitle}>The Daily Rep</Text>
                                <Text style={styles.bigCardDesc}>
                                    Fresh AI-generated articles about training science.
                                </Text>
                            </View>
                            <ArrowRight color={colors.text.muted} size={18} />
                        </View>
                    </Card>
                </Pressable>

                <Pressable onPress={() => router.push('/(app)/subscriptions' as any)}>
                    <Card style={styles.blogTeaser}>
                        <View style={styles.blogTeaserRow}>
                            <View style={[styles.iconBubble, { backgroundColor: colors.indigo.soft }]}>
                                <Sparkles color={colors.indigo.light} size={22} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.bigCardTitle}>Subscriptions</Text>
                                <Text style={styles.bigCardDesc}>
                                    {user?.hasActiveSubscription ? 'Premium active' : 'Unlock advanced AI features'}
                                </Text>
                            </View>
                            <ArrowRight color={colors.text.muted} size={18} />
                        </View>
                    </Card>
                </Pressable>
            </View>

            <View style={styles.section}>
                <View style={styles.activityHeader}>
                    {/* REMOVED: BarChart3 Icon */}
                    <Text style={styles.activityTitle}>Recent Activity</Text>
                </View>

                <Pressable onPress={() => router.push('/(app)/history' as any)}>
                    <Card style={styles.historyCard}>
                        <View style={styles.historyRow}>
                            <View style={styles.historyIcon}>
                                <BarChart3 color={colors.accent.cyanLight} size={20} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.historyTitle}>See recent workouts</Text>
                                <Text style={styles.historyDesc}>
                                    Browse every session you've logged with full set details.
                                </Text>
                            </View>
                            {/* REMOVED GLOW: Changed color to colors.text.muted */}
                            <ArrowRight color={colors.text.muted} size={18} />
                        </View>
                    </Card>
                </Pressable>
            </View>
        </Screen>
    );
}

const tintFor = (a: QuickAction['accent']): string => {
    return a === 'cyan' ? colors.accent.cyanSoft
        : a === 'indigo' ? colors.indigo.soft
            : a === 'rose' ? colors.rose.soft
                : a === 'emerald' ? colors.emerald.soft
                    : colors.amber.soft;
};
const accentText = (a: QuickAction['accent']): string => {
    return a === 'cyan' ? colors.accent.cyanLight
        : a === 'indigo' ? colors.indigo.light
            : a === 'rose' ? colors.rose.light
                : a === 'emerald' ? colors.emerald.light
                    : colors.amber.light;
};

const styles = StyleSheet.create({
    heroBlock: { marginTop: spacing.xl, marginBottom: spacing.xl2 },
    welcome: { ...typography.display, color: colors.text.primary },
    welcomeAccent: { color: colors.accent.cyanLight },
    subline: { ...typography.body, color: colors.text.muted, marginTop: spacing.sm },
    grid: { gap: spacing.md, marginBottom: spacing.xl2 },
    bigCard: { gap: spacing.sm },
    iconBubble: {
        width: 52, height: 52, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.md,
    },
    bigCardTitle: { ...typography.h2, color: colors.text.primary },
    bigCardDesc: { ...typography.body, color: colors.text.faint },
    bigCardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
    bigCardCta: { ...typography.label, fontWeight: '700' },
    section: { marginBottom: spacing.xl2 },
    sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.md },
    toolsRow: { flexDirection: 'row', gap: spacing.md },
    toolCard: { flex: 1 },
    toolInner: { padding: spacing.lg },
    toolIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.md,
    },
    toolTitle: { ...typography.bodyBold, color: colors.text.primary, marginBottom: 2 },
    toolDesc: { ...typography.small, color: colors.text.faint },
    blogTeaser: { marginBottom: spacing.md },
    blogTeaserRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    activityTitle: {
        ...typography.h3,
        color: colors.text.primary,
        lineHeight: 22,
    },
    historyCard: {},
    historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.accent.cyanSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyTitle: { ...typography.bodyBold, color: colors.text.primary, fontSize: 16 },
    historyDesc: { ...typography.small, color: colors.text.muted, marginTop: 2 },
});