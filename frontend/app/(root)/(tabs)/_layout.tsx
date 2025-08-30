import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const themeColors = {
    primary: "#2563EB",        // Active tab (blue)
    primaryHover: "#1E40AF",   // Darker blue for press
    background: "#FFFFFF",     // Pure white
    backgroundAlt: "#F9FAFB",  // Light gray background
    textMuted: "#9CA3AF",      // Muted gray for inactive
};

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: themeColors.primary,   // Blue for active
                tabBarInactiveTintColor: themeColors.textMuted, // Muted gray for inactive
                tabBarStyle: {
                    backgroundColor: themeColors.background, // White surface
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB", // Subtle divider
                    elevation: 4, // Android shadow
                    shadowOpacity: 0.05, // iOS shadow
                    height: 80,
                    paddingBottom:  2,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 8,
                },
                tabBarIconStyle: {
                    marginBottom: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favorites",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;
