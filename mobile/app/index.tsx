import { SafeAreaView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import './global.css'

export default function Index() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 1.5s splash
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        if (isAuthenticated) {
            router.replace("/(home)/home");
        } else {
            router.push("/(auth)/Login");
        }
    };

    const handleSignUp = () => {
        router.push("/(auth)/SignUp");
    };

    return (
        <SafeAreaView className="flex-1 bg-paper items-center justify-center px-6">
            {/* Splash / App Title */}
            <View className="items-center mb-12">
                <Text className="text-7xl mb-4" style={{ lineHeight: 84 }}>📚</Text>
                <Text className="text-5xl font-serif font-bold text-leather mb-2">
                    BookStore
                </Text>
                <Text className="text-ink text-center text-lg px-4">
                    Discover, read, and collect your favorite books all in one place.
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#f59e0b" />
            ) : (
                <View className="w-full space-y-4">
                    {/* Continue / Get Started Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        className="bg-brand-400 rounded-2xl py-4 px-6 shadow-book"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-primary font-semibold text-lg text-center">
                            {isAuthenticated ? "Continue to Library 📚" : "Get Started"}
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Button (if not authenticated) */}
                    {!isAuthenticated && (
                        <TouchableOpacity
                            onPress={handleSignUp}
                            className="bg-paper border-2 border-brand-400 rounded-2xl py-4 px-6 shadow-card mt-4"
                            activeOpacity={0.8}
                        >
                            <Text className="text-brand-400 font-primary font-semibold text-lg text-center">
                                Create New Account
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Info Text */}
                    {!isAuthenticated && (
                        <Text className="text-ink text-center text-sm mt-4">
                            Join thousands of book lovers worldwide
                        </Text>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}
