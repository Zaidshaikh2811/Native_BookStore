import { SafeAreaView, Text, View, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import './global.css'

const { width, height } = Dimensions.get('window');

export default function Index() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [loading, setLoading] = useState(true);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const bookIconAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations sequence
        Animated.sequence([
            // Book icon animation
            Animated.spring(bookIconAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            // Main content animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ])
        ]).start();

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1800); // Slightly longer for better UX

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
        <SafeAreaView className="flex-1 bg-gradient-to-br from-paper via-amber-50 to-orange-50">
            {/* Background Pattern Overlay */}
            <View className="absolute inset-0 opacity-5">
                <View className="flex-1 bg-repeat" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23d97706" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }} />
            </View>

            <View className="flex-1 items-center justify-center px-6 relative">
                {/* Main Content Container */}
                <Animated.View
                    className="items-center mb-16"
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }}
                >
                    {/* Animated Book Icon with Glow Effect */}
                    <Animated.View
                        className="mb-8 relative"
                        style={{
                            transform: [
                                {
                                    scale: bookIconAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.5, 1.2, 1]
                                    })
                                },
                                {
                                    rotate: bookIconAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['-10deg', '0deg']
                                    })
                                }
                            ]
                        }}
                    >
                        {/* Glow Effect */}
                        <View className="absolute inset-0 bg-brand-200 rounded-full opacity-20 blur-xl scale-150" />

                        {/* Book Stack Visual */}
                        <View className="relative">
                            <Text className="text-8xl mb-2 drop-shadow-lg" style={{ lineHeight: 96 }}>📚</Text>
                            {/* Floating sparkles */}
                            <View className="absolute -top-2 -right-2">
                                <Text className="text-yellow-400 text-2xl animate-pulse">✨</Text>
                            </View>
                            <View className="absolute -bottom-1 -left-3">
                                <Text className="text-amber-400 text-xl animate-bounce">⭐</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* App Title with Enhanced Typography */}
                    <View className="items-center mb-6">
                        <Text className="text-6xl font-serif font-bold text-leather mb-3 tracking-wide drop-shadow-sm">
                            BookStore
                        </Text>
                        <View className="w-24 h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full mb-4" />
                        <Text className="text-ink/80 text-center text-lg px-8 leading-6 font-light">
                            Discover, read, and collect your favorite books all in one place
                        </Text>
                        <Text className="text-brand-500 text-center text-sm mt-2 font-medium">
                            📖 Your literary journey begins here
                        </Text>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                {loading ? (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#f59e0b" />
                        <Text className="text-ink/60 mt-4 text-sm">Loading your library...</Text>
                    </View>
                ) : (
                    <Animated.View
                        className="w-full max-w-sm space-y-4"
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        {/* Primary Action Button */}
                        <TouchableOpacity
                            onPress={handleContinue}
                            className="bg-brand-300 rounded-2xl mb-4 py-5 px-8 shadow-2xl shadow-brand-400/30 border border-paper/80"
                            activeOpacity={0.85}
                            style={{
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                        >
                            <View className="flex-row items-center justify-center">
                                <Text className="text-brand-600 font-primary font-bold text-lg text-center mr-2">
                                    {isAuthenticated ? "Continue to Library" : "Get Started"}
                                </Text>
                                <Text className="text-xl">
                                    {isAuthenticated ? "📚" : "🚀"}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Secondary Action Button */}
                        {!isAuthenticated && (
                            <TouchableOpacity
                                onPress={handleSignUp}
                                className="bg-paper/80 backdrop-blur border-2 border-brand-300 rounded-2xl py-5 px-8 shadow-lg"
                                activeOpacity={0.85}
                                style={{
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Text className="text-brand-600 font-primary font-bold text-lg text-center mr-2">
                                        Create New Account
                                    </Text>
                                    <Text className="text-lg">📝</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Info Text with Stats */}
                        {!isAuthenticated && (
                            <View className="items-center mt-8 pt-6 border-t border-ink/10">
                                <Text className="text-ink/70 text-center text-sm font-medium mb-2">
                                    Join thousands of book lovers worldwide
                                </Text>
                                <View className="flex-row space-x-6 mt-3">
                                    <View className="items-center">
                                        <Text className="text-brand-500 font-bold text-lg">10K+</Text>
                                        <Text className="text-ink/60 text-xs">Books</Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-brand-500 font-bold text-lg">50K+</Text>
                                        <Text className="text-ink/60 text-xs">Readers</Text>
                                    </View>
                                    <View className="items-center">
                                        <Text className="text-brand-500 font-bold text-lg">4.9★</Text>
                                        <Text className="text-ink/60 text-xs">Rating</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                )}
            </View>

            {/* Footer Quote */}
            <View className="pb-safe px-6 pb-4">
                <Text className="text-ink/50 text-center text-xs italic">
                    "A room without books is like a body without a soul" - Cicero
                </Text>
            </View>
        </SafeAreaView>
    );
}