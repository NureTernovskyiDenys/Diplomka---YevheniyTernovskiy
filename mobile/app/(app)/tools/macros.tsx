import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Save, Pickaxe } from 'lucide-react-native';

import { Screen, Card, TextField, PrimaryButton, Toast, BackButton } from '../../../src/components';
import { ApiRegistry, formatError } from '../../../src/services';
import { useAuth } from '../../../src/context/AuthContext';
import { MACRO_PRESETS, MacroPreset, MacroSplitter } from '../../../src/lib/fitness';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function MacroScreen() {
    const { user, userId, refreshUser } = useAuth();
    const api = ApiRegistry.instance;

    const [calories, setCalories] = useState(user?.profile.targetCalories?.toString() ?? '');
    const [preset, setPreset] = useState<MacroPreset>(MACRO_PRESETS[0]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const grams = useMemo(() => {
        const cals = parseInt(calories, 10);
        if (!cals) return null;
        return MacroSplitter.gramsFor(cals, preset);
    }, [calories, preset]);

    const onSave = async () => {
        if (!grams || !userId) return;
        setSaveStatus('saving');
        setError(null);
        try {
            await api.users.update(userId, {
                profile: {
                    ...(user?.profile ?? {}),
                    targetCalories: parseInt(calories, 10),
                    targetProtein: grams.protein,
                    targetCarbs: grams.carbs,
                    targetFat: grams.fat,
                    macroDietName: preset.name,
                },
            });
            await refreshUser();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (e) {
            setError(formatError(e));
            setSaveStatus('error');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Screen scroll>
                <BackButton />

                <View style={styles.heroRow}>
                    <View style={styles.heroIcon}>
                        <Pickaxe color={colors.indigo.light} size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Macro Splitter</Text>
                        <Text style={styles.subtitle}>Pick a diet architecture, get your grams.</Text>
                    </View>
                </View>

                {error ? <Toast message={error} tone="error" /> : null}
                {saveStatus === 'saved' ? <Toast message="Saved as primary diet." tone="success" /> : null}

                <Card style={{ marginBottom: spacing.lg, gap: spacing.lg }}>
                    <TextField
                        label="Target Calories"
                        keyboardType="numeric"
                        placeholder="2500"
                        value={calories}
                        onChangeText={setCalories}
                        hint="Use the Calorie Calculator if you don't know yet."
                    />
                </Card>

                <Card style={{ marginBottom: spacing.lg, gap: spacing.md }}>
                    <Text style={styles.sectionLabel}>Diet Architectures</Text>
                    <View style={{ gap: spacing.sm }}>
                        {MACRO_PRESETS.map((p) => {
                            const active = preset.name === p.name;
                            return (
                                <Pressable
                                    key={p.name}
                                    onPress={() => setPreset(p)}
                                    style={[styles.preset, active && styles.presetActive]}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.presetName, active && styles.presetNameActive]}>{p.name}</Text>
                                        <Text style={styles.presetDesc}>{p.description}</Text>
                                    </View>
                                    <View style={styles.presetSplit}>
                                        <Text style={[styles.splitText, { color: colors.emerald.light }]}>{p.carbs}%</Text>
                                        <Text style={[styles.splitText, { color: colors.indigo.light }]}>{p.protein}%</Text>
                                        <Text style={[styles.splitText, { color: colors.amber.light }]}>{p.fat}%</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </Card>

                {grams ? (
                    <Card style={{ marginBottom: spacing.lg, gap: spacing.md }}>
                        <Text style={styles.sectionLabel}>{preset.name} Daily Targets</Text>
                        <MacroBig label="Protein" value={grams.protein} unit="g" tone="indigo" pct={preset.protein} />
                        <MacroBig label="Carbs" value={grams.carbs} unit="g" tone="emerald" pct={preset.carbs} />
                        <MacroBig label="Fat" value={grams.fat} unit="g" tone="amber" pct={preset.fat} />
                    </Card>
                ) : null}

                <PrimaryButton
                    label={saveStatus === 'saved' ? 'Saved!' : 'Set as Primary Diet'}
                    icon={<Save color={colors.bg.base} size={18} />}
                    onPress={onSave}
                    loading={saveStatus === 'saving'}
                    disabled={!grams}
                    size="lg"
                />
            </Screen>
        </KeyboardAvoidingView>
    );
}

const MacroBig: React.FC<{ label: string; value: number; unit: string; tone: 'indigo' | 'emerald' | 'amber'; pct: number }> = ({ label, value, unit, tone, pct }) => {
    const tint = tone === 'indigo' ? colors.indigo.light : tone === 'emerald' ? colors.emerald.light : colors.amber.light;
    return (
        <View style={styles.macroBig}>
            <Text style={[styles.macroLabel, { color: tint }]}>{label}</Text>
            <View style={styles.macroValueRow}>
                <Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
                <Text style={styles.macroPct}>{pct}% of total</Text>
            </View>
        </View>
    );
};

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
        backgroundColor: colors.indigo.soft,
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
    sectionLabel: {
        ...typography.label,
        color: colors.text.muted,
    },
    preset: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.default,
        gap: spacing.md,
    },
    presetActive: {
        borderColor: colors.indigo.base,
        backgroundColor: colors.indigo.soft,
    },
    presetName: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    presetNameActive: {
        color: colors.indigo.light,
    },
    presetDesc: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: 2,
    },
    presetSplit: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    splitText: {
        ...typography.label,
        fontSize: 11,
    },
    macroBig: {
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.muted,
        borderRadius: radius.md,
        padding: spacing.lg,
    },
    macroLabel: {
        ...typography.label,
        marginBottom: spacing.xs,
    },
    macroValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    macroValue: {
        ...typography.display,
        color: colors.text.primary,
        fontVariant: ['tabular-nums'],
        fontSize: 32,
    },
    macroUnit: {
        ...typography.body,
        color: colors.text.faint,
    },
    macroPct: {
        ...typography.small,
        color: colors.text.faint,
    },
});
