import React, { useState } from "react";
import {
    ScrollView,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1  items-center px-6">
                    {/* App Image */}
                    <Image
                        source={require("../assets/images/logo.png")}
                        className=" w-48 h-48 mb-8 "

                    />
                    {/* Heading */}
                    <Text className="font-display text-4xl text-primary mb-2">
                        Welcome Back
                    </Text>
                    <Text className="text-textMuted text-base mb-8">
                        Sign in to continue exploring properties
                    </Text>

                    {/* Card container */}
                    <View className="w-full bg-backgroundAlt p-6 rounded-2xl shadow-card">
                        {/* Email */}
                        <Text className="text-text font-sans text-sm mb-2">Email</Text>
                        <TextInput
                            className="w-full bg-surface rounded-lg p-3 mb-4 text-text"
                            placeholder="you@example.com"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Password */}
                        <Text className="text-text font-sans text-sm mb-2">Password</Text>
                        <TextInput
                            className="w-full bg-surface rounded-lg p-3 mb-6 text-text"
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {/* Button */}
                        <TouchableOpacity
                            className="bg-primary py-3 rounded-lg shadow-glow"
                            onPress={() => {
                                console.log("Signing in with", email, password);
                            }}
                        >
                            <Text className="text-white font-semibold text-center text-base">
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        {/* Forgot password */}
                        <TouchableOpacity className="mt-4">
                            <Text className="text-primary text-center text-sm">
                                Forgot your password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign up link */}
                    <View className="flex-row justify-center items-center mt-6">
                        <Text className="text-textSubtle text-sm">
                            Don’t have an account?
                        </Text>
                        <TouchableOpacity>
                            <Text className="text-primary font-medium text-sm ml-1">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignIn;
