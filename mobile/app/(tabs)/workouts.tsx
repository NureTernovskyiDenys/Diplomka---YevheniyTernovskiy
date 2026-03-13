import { StyleSheet, Text, View } from 'react-native';

export default function WorkoutsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Workouts</Text>
            <View style={styles.card}>
                <Text style={styles.text}>Connect to the /workouts API here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 20,
        paddingTop: 60
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20
    },
    card: {
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 12,
    },
    text: {
        color: '#94A3B8'
    }
});
