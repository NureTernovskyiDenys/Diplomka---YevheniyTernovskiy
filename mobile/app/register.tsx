import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/register', { name, email, password });
            router.replace('/'); // Send back to login screen
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formCard}>
                <Text style={styles.header}>Create Account</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                />

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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.linkText}>Already have an account? Log in</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    formCard: {
        width: '100%',
        backgroundColor: '#1E293B',
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
        backgroundColor: '#334155',
        color: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        fontSize: 16
    },
    button: {
        backgroundColor: '#38BDF8',
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
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center'
    },
    linkText: {
        color: '#94A3B8',
        textAlign: 'center',
        fontSize: 14
    }
});
