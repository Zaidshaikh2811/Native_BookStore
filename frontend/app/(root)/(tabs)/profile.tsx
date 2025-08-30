import React from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
    // Example user data (replace with real data)
    const user = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        avatar: require('../../../assets/images/logo.png'),
    };

    const handleLogout = () => {
        console.log('User logged out');
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-6 pb-10"
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mt-6">
                    <Text className="text-3xl font-bold text-primary">Profile</Text>
                    <Ionicons name="notifications-outline" size={28} color="#6B7280" />
                </View>

                {/* Avatar + Info */}
                <View className="items-center mt-10">
                    <View className="relative">
                        <Image
                            source={user.avatar}
                            className="w-32 h-32 rounded-full mb-4 border-4 border-primary shadow-md"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            className="absolute right-2 bottom-5 bg-surface p-2 rounded-full border border-divider shadow-sm"
                            onPress={() => { /* edit profile image */ }}
                        >
                            <Ionicons name="pencil-outline" size={18} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-bold text-text">{user.name}</Text>
                    <Text className="text-base text-textMuted">{user.email}</Text>
                </View>

                {/* Quick Actions */}
                <View className="mt-10 bg-surface rounded-xl shadow-card p-4">
                    <TouchableOpacity className="flex-row items-center py-4 border-b border-divider">
                        <Ionicons name="person-outline" size={22} color="#2563EB" />
                        <Text className="ml-3 text-lg text-text">Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center py-4 border-b border-divider">
                        <Ionicons name="home-outline" size={22} color="#2563EB" />
                        <Text className="ml-3 text-lg text-text">My Properties</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center py-4 border-b border-divider">
                        <Ionicons name="heart-outline" size={22} color="#2563EB" />
                        <Text className="ml-3 text-lg text-text">Saved Listings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center py-4">
                        <Ionicons name="settings-outline" size={22} color="#2563EB" />
                        <Text className="ml-3 text-lg text-text">Settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <View className="mt-10 items-center">
                    <TouchableOpacity
                        className="bg-error px-8 py-3 rounded-xl shadow-md"
                        onPress={handleLogout}
                    >
                        <Text className="text-white text-lg font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
