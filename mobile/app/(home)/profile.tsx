import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import UserBooks from "@/components/UserBooks";
import ForgotPassword from "@/components/ForgotPassword";
import UpdateProfile from "@/components/UpdateProfile";
import Toast from "react-native-toast-message";
import api from "@/lib/api";

interface UserStats {
    totalBooks: number;
    totalReviews: number;
    averageRating: number;
    memberSince: string;
}

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    // Modal states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showUpdateProfile, setShowUpdateProfile] = useState(false);
    const [booksRefreshTrigger, setBooksRefreshTrigger] = useState(0);

    // Data states
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/(auth)/Login");
        }
    }, [isAuthenticated, router]);


    const fetchUserStats = useCallback(async () => {
        try {
            const response = await api.get('/user/stats');
            console.log('User stats response:', response.data);
            if (response.data) {
                setUserStats(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            // Don't show error toast for stats as it's not critical
            // Just use default values
            setUserStats({
                totalBooks: 0,
                totalReviews: 0,
                averageRating: 0,
                memberSince: user?.createdAt || new Date().toISOString()
            });
        }
    }, [user?.createdAt]);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            if (!isAuthenticated || !user) return;

            try {
                setLoading(true);
                await fetchUserStats();
            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isAuthenticated, user, fetchUserStats]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchUserStats();
            // Trigger books refresh by incrementing the trigger
            setBooksRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error refreshing profile:', error);
            Toast.show({
                type: "error",
                text1: "Refresh Failed",
                text2: "Unable to refresh profile data",
            });
        } finally {
            setRefreshing(false);
        }
    }, [fetchUserStats]);

    // Handle logout
    const handleLogout = useCallback(() => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        Toast.show({
                            type: "success",
                            text1: "Signed Out",
                            text2: "You have been successfully signed out",
                        });
                        router.replace("/(auth)/Login");
                    },
                },
            ]
        );
    }, [logout, router]);

    // Calculate days since joining
    const getDaysSinceJoining = useCallback((createdAt: string) => {
        const joinDate = new Date(createdAt);
        const today = new Date();
        const timeDiff = today.getTime() - joinDate.getTime();
        return Math.floor(timeDiff / (1000 * 3600 * 24));
    }, []);

    // Handle profile update callback
    const handleProfileUpdated = useCallback(() => {
        fetchUserStats();
        // You might also want to refresh user data in auth store
    }, [fetchUserStats]);

    const renderProfileHeader = () => {
        if (loading) {
            return (
                <View className="p-6 items-center">
                    <ActivityIndicator size="large" color="#d97706" />
                    <Text className="text-ink/60 mt-2 font-body">Loading profile...</Text>
                </View>
            );
        }

        return (
            <View className="bg-paper">
                {/* Profile Header Card */}
                <View className="mx-4 mt-4 mb-6 p-6 bg-white rounded-2xl shadow-card border border-brand-100">
                    {/* Avatar Section */}
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 bg-brand-600 rounded-full items-center justify-center mb-4 shadow-book">
                            <Text className="text-3xl font-serif font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
                            </Text>
                        </View>
                        <Text className="text-2xl font-serif font-bold text-leather mb-1">
                            {user?.name || "Guest User"}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="mail-outline" size={16} color="#6b7280" />
                            <Text className="text-ink/70 font-body ml-2">
                                {user?.email || "No email"}
                            </Text>
                        </View>
                        {user?.createdAt && (
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                <Text className="text-ink/60 font-body ml-2 text-sm">
                                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* User Stats */}
                    <View className="flex-row justify-around mb-6 py-4 border-t border-b border-gray-100">
                        <View className="items-center">
                            <Text className="text-2xl font-primary font-bold text-brand-600">
                                {userStats?.totalBooks || 0}
                            </Text>
                            <Text className="text-sm text-ink/60 font-body">Books</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-primary font-bold text-brand-600">
                                {userStats?.totalReviews || 0}
                            </Text>
                            <Text className="text-sm text-ink/60 font-body">Reviews</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-primary font-bold text-brand-600">
                                {user?.createdAt ? getDaysSinceJoining(user.createdAt) : 0}
                            </Text>
                            <Text className="text-sm text-ink/60 font-body">Days</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        <TouchableOpacity
                            className="bg-brand-500 rounded-lg py-3 px-4 shadow-book mt-2"
                            onPress={() => setShowUpdateProfile(true)}
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="person-outline" size={20} color="white" />
                                <Text className="text-white font-primary font-semibold ml-2 ">
                                    Update Profile
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white border-2 border-brand-300 rounded-lg py-3 px-4 mt-4"
                            onPress={() => setShowForgotPassword(true)}
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="key-outline" size={20} color="#d97706" />
                                <Text className="text-brand-600 font-primary font-semibold ml-2">
                                    Change Password
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 mt-4"
                            onPress={handleLogout}
                        >
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="log-out-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-600 font-primary font-semibold ml-2">
                                    Sign Out
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Books Section Header */}
                <View className="mx-4 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="library-outline" size={24} color="#92400e" />
                            <Text className="text-xl font-serif font-bold text-leather ml-2">
                                Your Library
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-brand-600 font-body text-sm mr-2">
                                {userStats?.totalBooks || 0} books
                            </Text>
                            <View className="w-2 h-2 bg-brand-400 rounded-full"></View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Don't render anything if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <FlatList
                data={[{ id: "books-list" }]}
                keyExtractor={(item) => item.id}
                renderItem={() => (
                    <UserBooks
                        refreshTrigger={booksRefreshTrigger}
                        onStatsUpdate={fetchUserStats}
                    />
                )}
                ListHeaderComponent={renderProfileHeader}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#d97706']}
                        tintColor="#d97706"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 20,
                    flexGrow: 1
                }}
            />

            {/* Modals */}
            <ForgotPassword
                visible={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                userEmail={user?.email}
            />

            <UpdateProfile
                visible={showUpdateProfile}
                onClose={() => setShowUpdateProfile(false)}
                onUpdated={handleProfileUpdated}
            />
        </SafeAreaView>
    );
}