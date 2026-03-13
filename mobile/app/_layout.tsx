import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: 'Login' }} />
                <Stack.Screen name="register" options={{ title: 'Register' }} />
                <Stack.Screen name="(tabs)" options={{ title: 'App' }} />
            </Stack>
        </AuthProvider>
    );
}
