import React, { useState } from 'react';
import { Text, View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, TextField, PrimaryButton, Toast } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async () => {
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        setError(null);
        const res = await login(email.trim(), password);
        setLoading(false);
        if (!res.success) setError(res.error ?? 'Login failed.');
        else router.replace('/(app)/dashboard');
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

                <View style={styles.heroBlock}>
                    <Text style={styles.tagline}>Master Your</Text>
                    <Text style={[styles.tagline, styles.taglineAccent]}>Technique</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.glow} />
                    <View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Access your premium analysis dashboard.</Text>
                    </View>

                    {error ? <Toast message={error} tone="error" /> : null}

                    <TextField
                        label="Email Address"
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        value={email}
                        onChangeText={setEmail}
                        style={{ marginBottom: spacing.lg }}
                    />
                    <TextField
                        label="Password"
                        placeholder="••••••••"
                        secureTextEntry
                        textContentType="password"
                        value={password}
                        onChangeText={setPassword}
                        style={{ marginBottom: spacing.xl }}
                    />

                    <PrimaryButton
                        label={loading ? 'Authenticating...' : 'Sign In'}
                        loading={loading}
                        onPress={onSubmit}
                        size="lg"
                    />

                    <Pressable onPress={() => router.push('/(auth)/register')} style={styles.linkRow}>
                        <Text style={styles.linkMuted}>Don't have an account? </Text>
                        <Text style={styles.linkAccent}>Sign up</Text>
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
        marginBottom: spacing.xl3,
    },
    logoDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.accent.cyan,
        shadowColor: colors.accent.cyan,
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    brandLabel: {
        ...typography.h3,
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    heroBlock: {
        marginBottom: spacing.xl3,
    },
    tagline: {
        fontSize: 44,
        fontWeight: '900',
        letterSpacing: -2,
        color: colors.text.primary,
        lineHeight: 48,
    },
    taglineAccent: {
        color: colors.accent.cyanLight,
    },
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
        top: -50,
        alignSelf: 'center',
        width: 240,
        height: 100,
        backgroundColor: colors.accent.cyanGlow,
        borderRadius: 999,
        opacity: 0.6,
    },
    title: {
        ...typography.h1,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.muted,
        marginBottom: spacing.xl2,
    },
    linkRow: {
        marginTop: spacing.xl,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    linkMuted: {
        ...typography.small,
        color: colors.text.faint,
    },
    linkAccent: {
        ...typography.small,
        color: colors.accent.cyanLight,
        fontWeight: '700',
    },
});
