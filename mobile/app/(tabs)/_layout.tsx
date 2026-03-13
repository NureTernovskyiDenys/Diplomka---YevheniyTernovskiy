import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1E293B', // Slate 800
                    borderTopColor: '#334155',
                },
                tabBarActiveTintColor: '#38BDF8', // Sky 400
                tabBarInactiveTintColor: '#94A3B8',
            }}
        >
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Body Map',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="human-handsdown" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: 'Workouts',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
