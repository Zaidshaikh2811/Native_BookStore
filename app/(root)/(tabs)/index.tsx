import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import Search from "@/components/Search";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, FeaturedCard } from "@/components/Card";

export default function Index() {
    const user = {
        name: "John Doe",
        email: "john.doe@email.com",
        avatar: require("../../../assets/images/logo.png"),
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 pt-4">
                    {/* User Avatar + Name */}
                    <View className="flex-row items-center space-x-3 gap-2">
                        <Image
                            source={user.avatar}
                            className="w-12 h-12 rounded-full border-2 border-primary shadow"
                            resizeMode="cover"
                        />
                        <View>
                            <Text className="text-lg font-semibold text-gray-900">
                                Hi, {user.name.split(" ")[0]} 👋
                            </Text>
                            <Text className="text-sm text-gray-500">{user.email}</Text>
                        </View>
                    </View>

                    {/* Notifications Icon */}
                    <TouchableOpacity className="p-2 rounded-full bg-gray-100">
                        <Ionicons name="notifications-outline" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="mt-5 px-4">
                    <Search />
                </View>

                {/* Featured Section */}
                <View className="flex-row items-center justify-between mt-6 px-4">
                    <Text className="text-lg font-semibold text-gray-900">
                        Featured Properties
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-sm font-medium text-primary">See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-4 pl-4"
                >
                    <FeaturedCard onPress={() => {}} />
                    <FeaturedCard onPress={() => {}} />
                    <FeaturedCard onPress={() => {}} />
                </ScrollView>

                {/* Recommended Section */}
                <View className="flex-row items-center justify-between mt-8 px-4">
                    <Text className="text-lg font-semibold text-gray-900">
                        Recommended For You
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-sm font-medium text-primary">See All</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-4 mt-4 space-y-4">
                    <Card />
                    <Card />
                    <Card />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
