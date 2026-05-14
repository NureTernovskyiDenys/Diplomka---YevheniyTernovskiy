import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Platform-aware key/value storage.
 *
 * - Native (iOS/Android): expo-secure-store (Keychain / Keystore).
 * - Web: localStorage. SecureStore is a native module and crashes in the browser
 *   (`ExpoSecureStore.default.getValueWithKeyAsync is not a function`), so the
 *   service must never call SecureStore directly.
 */
export class SecureStorage {
    static async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            try { return globalThis.localStorage?.getItem(key) ?? null; }
            catch { return null; }
        }
        return SecureStore.getItemAsync(key);
    }

    static async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            try { globalThis.localStorage?.setItem(key, value); }
            catch { /* ignore */ }
            return;
        }
        await SecureStore.setItemAsync(key, value);
    }

    static async deleteItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            try { globalThis.localStorage?.removeItem(key); }
            catch { /* ignore */ }
            return;
        }
        await SecureStore.deleteItemAsync(key);
    }
}
