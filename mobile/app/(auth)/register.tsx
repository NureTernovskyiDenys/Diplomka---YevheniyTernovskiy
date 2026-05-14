import React, { useState } from 'react';
import { Text, View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, TextField, PrimaryButton, Toast } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function RegisterScreen() {
    const router = useRouter();
    const { register } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async () => {
        if (!firstName || !lastName || !email || !password) {
            setError('Please fill out all fields.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError(null);
        const res = await register(firstName.trim(), lastName.trim(), email.trim(), password);
        setLoading(false);
        if (!res.success) setError(res.error ?? 'Registration failed.');
        // On success: AuthGate routes to /(onboarding) automatically.
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Screen scroll>
                <View style={styles.brand}>
                    <View style={styles.logoDot} />
                    <Text style={styles.brandLabel}>GymAnalysis</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.glow} />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start tracking, planning, and analyzing your training today.</Text>

                    {error ? <Toast message={error} tone="error" /> : null}

                    <TextField
                        label="First Name"
                        placeholder="Jane"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Last Name"
                        placeholder="Doe"
                        value={lastName}
                        onChangeText={setLastName}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Email Address"
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Password"
                        placeholder="At least 6 characters"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Confirm Password"
                        placeholder="Repeat password"
                        secureTextEntry
                        value={confirm}
                        onChangeText={setConfirm}
                        style={{ marginBottom: spacing.xl }}
                    />

                    <PrimaryButton
                        label={loading ? 'Creating account...' : 'Create Account'}
                        loading={loading}
                        onPress={onSubmit}
                        size="lg"
                    />

                    <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.linkRow}>
                        <Text style={styles.linkMuted}>Already have an account? </Text>
                        <Text style={styles.linkAccent}>Sign in</Text>
                    </Pressable>
                </View>
            </Screen>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
        marginBottom: spacing.xl2,
    },
    logoDot: {
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: colors.accent.cyan,
    },
    brandLabel: { ...typography.h3, color: colors.text.primary },
    card: {
        backgroundColor: 'rgba(24,24,27,0.6)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderRadius: radius.xl2,
        padding: spacing.xl2,
        position: 'relative',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        top: -60,
        alignSelf: 'center',
        width: 240,
        height: 100,
        backgroundColor: colors.accent.cyanGlow,
        borderRadius: 999,
        opacity: 0.55,
    },
    title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.text.muted, marginBottom: spacing.xl2 },
    linkRow: { marginTop: spacing.xl, flexDirection: 'row', justifyContent: 'center' },
    linkMuted: { ...typography.small, color: colors.text.faint },
    linkAccent: { ...typography.small, color: colors.accent.cyanLight, fontWeight: '700' },
});