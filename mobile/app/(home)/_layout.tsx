import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#d97706", // brand-500 (warm orange)
                tabBarInactiveTintColor: "#92400e", // leather brown
                tabBarStyle: {
                    backgroundColor: "#fefcf3", // paper background
                    borderTopWidth: 1,
                    borderTopColor: "#fbd9a5", // brand-200 (soft border)
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 4, // Android shadow
                },
                tabBarLabelStyle: {
                    fontFamily: "Inter",
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="addBook"
                options={{
                    title: "Add Book",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
