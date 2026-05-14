import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Loader } from '../src/components';

export default function StartRedirect() {
    const { initializing, isAuthenticated } = useAuth();
    if (initializing) return <Loader fullScreen label="Initializing" />;
    return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}
