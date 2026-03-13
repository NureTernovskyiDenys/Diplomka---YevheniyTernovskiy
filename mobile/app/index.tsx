import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);
        setError('');
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)/map');
        } else {
            setError(result.error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Master Your Technique</Text>

            <View style={styles.formCard}>
                <Text style={styles.header}>Sign In</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.linkText}>Don't have an account? Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Slate 900
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#38BDF8', // Sky 400
        marginBottom: 40,
        textAlign: 'center'
    },
    formCard: {
        width: '100%',
        backgroundColor: '#1E293B', // Slate 800
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    header: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 20
    },
    input: {
        backgroundColor: '#334155', // Slate 700
        color: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16
    },
    button: {
        backgroundColor: '#38BDF8', // Sky 400
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    errorText: {
        color: '#EF4444', // Red 500
        marginBottom: 16,
        textAlign: 'center'
    },
    linkText: {
        color: '#94A3B8', // Slate 400
        textAlign: 'center',
        fontSize: 14
    }
});
