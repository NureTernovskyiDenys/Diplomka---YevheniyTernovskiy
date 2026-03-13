import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use standard localhost for iOS simulator, or 10.0.2.2 for Android Emulator connecting to host machine.
// We are temporarily routing to the live Render server to bypass local Windows Firewall blocks.
export const API_BASE_URL = 'https://diplomka-flask.onrender.com/api/nest';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically inject JWT token into all requests
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Error retrieving token for request:", error);
    }
    return config;
});

export default api;
