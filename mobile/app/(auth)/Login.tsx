import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {Link} from "expo-router";
import {useAuthStore} from "@/store/authStore";
import api from "@/lib/api"

interface LoginProps {
    onNavigateToSignup: () => void;
    onLogin: (email: string, password: string) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onNavigateToSignup, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Reset errors
        setErrors({ email: '', password: '' });

        // Validation
        let hasErrors = false;
        const newErrors = { email: '', password: '' };

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
            hasErrors = true;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            hasErrors = true;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const resp = await api.post('/user/login', {
                email,
                password,
            });


            const { user, accessToken, refreshToken } = resp.data.data;


            useAuthStore.getState().setAuth({ user, accessToken, refreshToken });

        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    className="px-6"
                >
                    {/* Header */}
                    <View className="items-center mt-16 mb-8">
                        <View className="w-20 h-20 bg-brand-500 rounded-2xl items-center justify-center mb-4">
                            <Ionicons name="book" size={32} color="white" />
                        </View>
                        <Text className="text-4xl font-serif font-bold text-ink mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-lg text-gray-600 font-body text-center">
                            Sign in to continue your reading journey
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View className="space-y-6">
                        {/* Email Input */}
                        <View>
                            <Text className="text-base font-body font-medium text-ink mb-2">
                                Email Address
                            </Text>
                            <View className="relative">
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body ${
                                        errors.email ? 'border-error' : 'border-gray-200'
                                    } focus:border-brand-500`}
                                />
                                <View className="absolute right-4 top-3">
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={errors.email ? '#ef4444' : '#9CA3AF'}
                                    />
                                </View>
                            </View>
                            {errors.email ? (
                                <Text className="text-error text-sm mt-1 font-body">
                                    {errors.email}
                                </Text>
                            ) : null}
                        </View>

                        {/* Password Input */}
                        <View>
                            <Text className="text-base font-body font-medium text-ink mb-2 mt-4">
                                Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body pr-12  ${
                                        errors.password ? 'border-error' : 'border-gray-200'
                                    } focus:border-brand-500`}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3"
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={errors.password ? '#ef4444' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password ? (
                                <Text className="text-error text-sm mt-1 font-body">
                                    {errors.password}
                                </Text>
                            ) : null}
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity className="self-end">
                            <Text className="text-brand-600 font-body font-medium mt-4">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className={`bg-brand-500 rounded-lg py-4 items-center mt-4 ${
                                isLoading ? 'opacity-70' : ''
                            }`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Text className="text-white text-lg font-body font-semibold">
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>




                    </View>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center mt-8 mb-6">
                        <Text className="text-gray-600 font-body">
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={onNavigateToSignup}>
                            <Link href="/SignUp" className="text-brand-600 font-body font-semibold">
                                Sign Up
                            </Link>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;