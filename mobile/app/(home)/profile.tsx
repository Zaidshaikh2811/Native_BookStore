import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import UserBooks from "@/components/UserBooks"; // separate component for uploaded books

export default function Profile() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [reload, setReload] = useState(false); // to refresh books after update
    console.log(user)

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/(auth)/Login");
        }
    }, [isAuthenticated, router]);

    const handleUpdate = () => {
        // router.push("/profile/UpdateProfile");
    };

    return (
        <ScrollView className="flex-1 p-4 bg-paper">
            <View className="mb-6">
                <Text className="text-2xl font-serif font-bold text-leather mb-2">
                    {user?.name || "Guest"}
                </Text>
                <Text className="text-gray-600 mb-1">Email: {user?.email}</Text>
                <Text className="text-gray-600 mb-1">Joined: {new Date(user?.createdAt).toLocaleDateString()}</Text>
                <Button title="Update Details" onPress={handleUpdate} color="#d97706" />
            </View>

            <View className="mt-4">
                <Text className="text-xl font-bold text-leather mb-2">Your Uploaded Books</Text>
                <UserBooks   reload={reload} />
            </View>
        </ScrollView>
    );
}
