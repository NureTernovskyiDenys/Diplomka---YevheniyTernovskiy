import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const token = await SecureStore.getItemAsync('jwt_token');
                if (token) {
                    // Fetch profile to verify token validity
                    api.get('/users/profile')
                        .then(res => {
                            setUser(res.data);
                        })
                        .catch(err => {
                            console.log('Token expired or invalid', err);
                            SecureStore.deleteItemAsync('jwt_token');
                        });
                }
            } catch (error) {
                console.error("Failed to load auth:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token } = response.data;
            await SecureStore.setItemAsync('jwt_token', access_token);

            // Reload user profile
            const profileResponse = await api.get('/users/profile');
            setUser(profileResponse.data);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('jwt_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
