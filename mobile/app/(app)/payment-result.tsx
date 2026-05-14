import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentResult() {
    const params = useLocalSearchParams();

    // LiqPay повертає status в URL
    const status = params.status as string;
    const isSuccess = status === 'sandbox' || status === 'success';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isSuccess ? '✅ Оплата успішна!' : '❌ Оплата не вдалась'}
            </Text>
            <Text style={styles.subtitle}>
                {isSuccess
                    ? 'Ваша підписка активована'
                    : 'Спробуйте ще раз або зверніться до підтримки'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#666' },
});