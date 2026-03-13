import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user?.name || 'Loading...'}</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email || 'Loading...'}</Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Subscription</Text>
                <Text style={[styles.value, { color: user?.isPremium ? '#10B981' : '#F59E0B' }]}>
                    {user?.isPremium ? 'Premium Active' : 'Free Basic'}
                </Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 20,
        paddingTop: 60
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20
    },
    label: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 4
    },
    value: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 16
    },
    logoutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
        borderWidth: 1,
        borderColor: '#EF4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
