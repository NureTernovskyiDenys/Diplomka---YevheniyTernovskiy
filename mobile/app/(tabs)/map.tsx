import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function MapScreen() {
    const [selectedMuscle, setSelectedMuscle] = useState('Chest');

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Tap a Muscle Group</Text>

            <View style={styles.mapContainer}>
                {/* SVG implementation goes here */}
                <Text style={styles.placeholderText}>[Interactive SVG Human Body]</Text>
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.muscleTitle}>{selectedMuscle}</Text>
                <Text style={styles.text}>Suggested Exercises:</Text>
                <View style={styles.exerciseBadge}>
                    <Text style={styles.badgeText}>Bench Press</Text>
                </View>
                <View style={styles.exerciseBadge}>
                    <Text style={styles.badgeText}>Push-ups</Text>
                </View>
            </View>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center'
    },
    mapContainer: {
        height: 400,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155'
    },
    placeholderText: {
        color: '#94A3B8',
        fontSize: 16
    },
    detailsCard: {
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 16,
        marginBottom: 40
    },
    muscleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#38BDF8',
        marginBottom: 12
    },
    text: {
        color: '#94A3B8',
        marginBottom: 12
    },
    exerciseBadge: {
        backgroundColor: '#334155',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8
    },
    badgeText: {
        color: '#fff',
        fontWeight: '500'
    }
});
