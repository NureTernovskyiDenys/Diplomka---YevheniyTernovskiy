import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Dumbbell, Target, Activity, Zap } from 'lucide-react-native';

import { Screen, Card, TextField, EmptyState, BackButton } from '../../../src/components';
import { OneRepMaxCalculator } from '../../../src/lib/fitness';
import { colors, spacing, typography, radius } from '../../../src/theme';

const ZONE_TONES: Record<number, { color: string; bg: string }> = {
    100: { color: colors.rose.light, bg: colors.rose.soft },
    95: { color: colors.amber.light, bg: colors.amber.soft },
    90: { color: colors.amber.base, bg: colors.amber.soft },
    85: { color: colors.emerald.light, bg: colors.emerald.soft },
    80: { color: colors.accent.cyanLight, bg: colors.accent.cyanSoft },
    75: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
    70: { color: colors.indigo.light, bg: colors.indigo.soft },
};

export default function OneRepMaxScreen() {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

    const result = useMemo(() => OneRepMaxCalculator.compute(parseFloat(weight), parseInt(reps, 10)), [weight, reps]);
    const zones = useMemo(() => result ? OneRepMaxCalculator.zones(result.average) : [], [result]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Screen scroll>
                <BackButton />

                <View style={styles.heroRow}>
                    <View style={styles.heroIcon}>
                        <Dumbbell color={colors.rose.light} size={22} style={{ transform: [{ rotate: '-45deg' }] }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>One Rep Max</Text>
                        <Text style={styles.subtitle}>Estimate your strength ceiling.</Text>
                    </View>
                </View>

                <Card style={{ marginBottom: spacing.lg, gap: spacing.lg }}>
                    <View style={styles.row}>
                        <TextField
                            label="Weight Lifted"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            placeholder="100"
                            style={{ flex: 1 }}
                            rightAccessory={
                                <View style={styles.unitToggle}>
                                    <Pressable onPress={() => setUnit('kg')} style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}>
                                        <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>kg</Text>
                                    </Pressable>
                                    <Pressable onPress={() => setUnit('lbs')} style={[styles.unitBtn, unit === 'lbs' && styles.unitBtnActive]}>
                                        <Text style={[styles.unitText, unit === 'lbs' && styles.unitTextActive]}>lbs</Text>
                                    </Pressable>
                                </View>
                            }
                        />
                    </View>
                    <TextField
                        label="Reps Completed"
                        keyboardType="numeric"
                        value={reps}
                        onChangeText={setReps}
                        placeholder="5"
                    />
                </Card>

                {result ? (
                    <Card style={{ marginBottom: spacing.lg, alignItems: 'center', gap: spacing.sm }} accent="rose">
                        <Text style={styles.resultLabel}>ESTIMATED 1 REP MAX</Text>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultValue}>{result.average}</Text>
                            <Text style={styles.resultUnit}>{unit}</Text>
                        </View>
                        <Text style={styles.resultMeta}>Epley: {result.epley} • Brzycki: {result.brzycki}</Text>
                    </Card>
                ) : (
                    <Card style={{ marginBottom: spacing.lg }}>
                        <EmptyState
                            icon={<Activity color={colors.text.faint} size={32} />}
                            title="Enter your lift"
                            description="Type weight + reps above to see your max."
                        />
                    </Card>
                )}

                {result ? (
                    <Card>
                        <View style={styles.zoneHeader}>
                            <Target color={colors.emerald.light} size={18} />
                            <Text style={styles.zoneTitle}>Training Zones</Text>
                        </View>
                        <View style={{ gap: spacing.sm }}>
                            {zones.map((z) => {
                                const tone = ZONE_TONES[z.pct];
                                return (
                                    <View key={z.pct} style={[styles.zoneRow, { backgroundColor: tone.bg }]}>
                                        <Text style={[styles.zonePct, { color: tone.color }]}>{z.pct}%</Text>
                                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                                            <Text style={styles.zoneWeight}>{z.weight} {unit}</Text>
                                            <Text style={styles.zoneLabel}>{z.label}</Text>
                                        </View>
                                        <View style={styles.zoneRepsBox}>
                                            <Text style={styles.zoneRepsValue}>~{z.reps}</Text>
                                            <Text style={styles.zoneRepsLabel}>REPS</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                ) : null}
            </Screen>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    heroIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.rose.soft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
    },
    subtitle: {
        ...typography.small,
        color: colors.text.faint,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    unitToggle: {
        flexDirection: 'row',
        gap: 4,
    },
    unitBtn: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    unitBtnActive: {
        backgroundColor: colors.bg.surfaceAlt,
    },
    unitText: {
        ...typography.label,
        color: colors.text.faint,
    },
    unitTextActive: {
        color: colors.text.primary,
    },
    resultLabel: {
        ...typography.label,
        color: colors.rose.light,
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.sm,
    },
    resultValue: {
        fontSize: 64,
        fontWeight: '900',
        color: colors.text.primary,
        letterSpacing: -2,
        fontVariant: ['tabular-nums'],
    },
    resultUnit: {
        ...typography.h2,
        color: colors.text.faint,
        textTransform: 'uppercase',
    },
    resultMeta: {
        ...typography.small,
        color: colors.text.faint,
    },
    zoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.muted,
    },
    zoneTitle: {
        ...typography.h3,
        color: colors.text.primary,
    },
    zoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    zonePct: {
        width: 50,
        ...typography.h2,
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
    },
    zoneWeight: {
        ...typography.bodyBold,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    zoneLabel: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
    },
    zoneRepsBox: {
        alignItems: 'center',
    },
    zoneRepsValue: {
        ...typography.bodyBold,
        color: colors.text.secondary,
    },
    zoneRepsLabel: {
        ...typography.micro,
        fontSize: 9,
        color: colors.text.faint,
    },
});
