import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, Pressable, Animated, Alert } from 'react-native';
import { Sparkles, Shield, Check, Crown, Zap } from 'lucide-react-native';

import { Screen, Card, PrimaryButton, Loader, Toast, BackButton } from '../../src/components';
import { SubscriptionPlan } from '../../src/models';
import { ApiRegistry, formatError } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../src/theme';

const BACKEND_URL = 'http://localhost:3000/api/nest';

export default function SubscriptionsScreen() {
    const { user, refreshUser } = useAuth();
    const api = ApiRegistry.instance;

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setPlans(await api.subscriptions.list());
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { load(); }, [load]);

    const subscribeFree = async (id: string) => {
        setProcessingId(id);
        try {
            await api.subscriptions.subscribe(id);
            await refreshUser();
            setSelectedId(null);
        } catch (e) {
            setError(formatError(e));
        } finally {
            setProcessingId(null);
        }
    };

    const subscribePaid = async (plan: SubscriptionPlan) => {
        setProcessingId(plan.id);
        try {
            const response = await fetch(`${BACKEND_URL}/payments/create-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    amount: 20,
                    currency: 'USD',
                    description: `GymAnalysis - ${plan.name}`,
                    userId: user?.id ?? 'unknown',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment');
            }

            const { data, signature } = await response.json();

            // Submit form to LiqPay (web only)
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://www.liqpay.ua/api/3/checkout';
            form.target = '_self';

            const dataInput = document.createElement('input');
            dataInput.type = 'hidden';
            dataInput.name = 'data';
            dataInput.value = data;

            const signatureInput = document.createElement('input');
            signatureInput.type = 'hidden';
            signatureInput.name = 'signature';
            signatureInput.value = signature;

            form.appendChild(dataInput);
            form.appendChild(signatureInput);
            document.body.appendChild(form);
            form.submit();

        } catch (e) {
            setError(formatError(e));
            setProcessingId(null);
        }
    };

    const subscribe = (plan: SubscriptionPlan) => {
        if (plan.isFree) {
            subscribeFree(plan.id);
        } else {
            subscribePaid(plan);
        }
    };

    if (loading) return <Loader fullScreen label="Loading plans..." />;

    const selected = plans.find((p) => p.id === selectedId) ?? null;

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
            <Screen scroll>
                <BackButton />

                <View style={styles.heroBlock}>
                    <Text style={styles.title}>Level Up Your Training</Text>
                    <Text style={styles.subtitle}>
                        AI-powered analysis, unlimited workouts, advanced insights.
                    </Text>
                </View>

                {error ? <Toast message={error} tone="error" /> : null}

                <View style={{ gap: spacing.lg, paddingBottom: selected ? 120 : 0 }}>
                    {plans.map((plan) => {
                        const isCurrent = user?.subscription?.planId === plan.id;
                        const isSelected = selectedId === plan.id;
                        return (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isCurrent={isCurrent}
                                isSelected={isSelected}
                                onPress={() => {
                                    if (isCurrent) return;
                                    setSelectedId(isSelected ? null : plan.id);
                                }}
                            />
                        );
                    })}
                </View>
            </Screen>

            {selected ? (
                <View style={styles.confirmBar}>
                    <View style={styles.confirmInfo}>
                        <Text style={styles.confirmLabel}>Selected</Text>
                        <Text style={styles.confirmName} numberOfLines={1}>
                            {selected.name} · {selected.pricingLabel}
                        </Text>
                    </View>
                    <PrimaryButton
                        label={processingId === selected.id
                            ? (selected.isFree ? 'Subscribing...' : 'Redirecting...')
                            : (selected.isFree ? 'Confirm' : 'Pay $20')}
                        onPress={() => subscribe(selected)}
                        loading={processingId === selected.id}
                        size="md"
                        fullWidth={false}
                    />
                </View>
            ) : null}
        </View>
    );
}

interface PlanCardProps {
    plan: SubscriptionPlan;
    isCurrent: boolean;
    isSelected: boolean;
    onPress: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrent, isSelected, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, bounciness: 0 }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 0 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isCurrent}
            >
                <View
                    style={[
                        styles.card,
                        plan.isPremium && styles.premiumCard,
                        isSelected && styles.selectedCard,
                        isCurrent && styles.currentCard,
                    ]}
                >
                    {plan.isPremium && !isSelected ? (
                        <View style={styles.popularBadge}>
                            <Crown color={colors.accent.cyanLight} size={10} />
                            <Text style={styles.popularText}>Most Popular</Text>
                        </View>
                    ) : null}

                    {isSelected ? (
                        <View style={styles.selectedBadge}>
                            <Check color={colors.bg.base} size={14} strokeWidth={3} />
                        </View>
                    ) : null}

                    <View style={styles.planTitleRow}>
                        {plan.isPremium
                            ? <Sparkles color={colors.accent.cyanLight} size={20} />
                            : <Shield color={colors.text.muted} size={20} />
                        }
                        <Text style={styles.planName}>{plan.name}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceValue}>{plan.pricingLabel}</Text>
                        {!plan.isFree && <Text style={styles.priceUnit}> / {plan.durationInDays} days</Text>}
                    </View>

                    <View style={{ gap: spacing.sm, marginVertical: spacing.md }}>
                        {plan.features.map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <View style={[styles.featureBullet, plan.isPremium && styles.featureBulletPrem]}>
                                    {plan.isPremium
                                        ? <Zap color={colors.accent.cyanLight} size={10} />
                                        : <Check color={colors.emerald.light} size={10} />
                                    }
                                </View>
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {isCurrent ? (
                        <View style={styles.currentLabel}>
                            <Check color={colors.emerald.light} size={14} />
                            <Text style={styles.currentText}>Current plan</Text>
                        </View>
                    ) : (
                        <Text style={[styles.tapHint, isSelected && styles.tapHintActive]}>
                            {isSelected ? 'Tap again to deselect' : 'Tap to select'}
                        </Text>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    heroBlock: { marginBottom: spacing.xl2, alignItems: 'center' },
    title: { ...typography.h1, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.text.muted, textAlign: 'center', maxWidth: 320 },

    card: {
        position: 'relative',
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    premiumCard: {
        shadowColor: colors.accent.cyan,
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
    },
    selectedCard: {
        borderColor: colors.accent.cyan,
        borderWidth: 2,
        backgroundColor: colors.accent.cyanSoft,
    },
    currentCard: {
        borderColor: colors.emerald.base,
        opacity: 0.85,
    },

    popularBadge: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        backgroundColor: colors.accent.cyanSoft,
        borderColor: 'rgba(34,211,238,0.4)',
        borderWidth: 1,
        borderRadius: 999,
    },
    popularText: { ...typography.micro, color: colors.accent.cyanLight },

    selectedBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accent.cyan,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },

    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
        paddingRight: 40,
    },
    planName: { ...typography.h2, color: colors.text.primary },
    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    priceValue: {
        ...typography.display,
        fontSize: 36,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    priceUnit: { ...typography.body, color: colors.text.faint },

    featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    featureBullet: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.emerald.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureBulletPrem: { backgroundColor: colors.accent.cyanSoft },
    featureText: { ...typography.small, color: colors.text.secondary, flex: 1 },

    tapHint: {
        ...typography.small,
        color: colors.text.faint,
        textAlign: 'center',
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    tapHintActive: { color: colors.accent.cyanLight },

    currentLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    currentText: { ...typography.small, color: colors.emerald.light, fontWeight: '700' },

    confirmBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        backgroundColor: colors.bg.surface,
        borderTopWidth: 1,
        borderTopColor: colors.accent.cyan,
    },
    confirmInfo: { flex: 1 },
    confirmLabel: {
        ...typography.small,
        color: colors.text.faint,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
    },
    confirmName: { ...typography.bodyBold, color: colors.text.primary, marginTop: 2 },
});
