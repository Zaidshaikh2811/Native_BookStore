import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#6200ee",
                tabBarInactiveTintColor: "#999",
                tabBarStyle: { paddingBottom: 5, height: 60 },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "home",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
                }}
            />

        </Tabs>
    );
}
