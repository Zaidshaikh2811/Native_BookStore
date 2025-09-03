import React, {useEffect, useState} from 'react';
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
import {Link,useRouter} from "expo-router";
import {useAuthStore} from "@/store/authStore";

import api from "@/lib/api"
import Toast from "react-native-toast-message";


interface SignupProps {
    onNavigateToLogin: () => void;
    onSignup: (data: { fullName: string; email: string; password: string }) => void;
}

const SignupScreen: React.FC<SignupProps> = ({ onNavigateToLogin, onSignup }) => {
   const {user ,isAuthenticated}=useAuthStore()
    const router=useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): { isValid: boolean; message: string } => {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain uppercase, lowercase, and number',
            };
        }
        return { isValid: true, message: '' };
    };

    const handleSignup = async () => {

        console.log(user)
        setErrors({ fullName: '', email: '', password: '', confirmPassword: '', terms: '' });

        // Validation
        let hasErrors = false;
        const newErrors = { fullName: '', email: '', password: '', confirmPassword: '', terms: '' };

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            hasErrors = true;
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
            hasErrors = true;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
            hasErrors = true;
        }

        const passwordValidation = validatePassword(password);
        if (!password.trim()) {
            newErrors.password = 'Password is required';
            hasErrors = true;
        } else if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
            hasErrors = true;
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
            hasErrors = true;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasErrors = true;
        }

        if (!acceptTerms) {
            newErrors.terms = 'Please accept the terms and conditions';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {

            const resp = await api.post('/user/signup', {
                email,
                password,
                name: fullName,
            });

            const { user, accessToken, refreshToken } = resp.data.data;

            useAuthStore.getState().setAuth({ user, accessToken, refreshToken });

            Toast.show({
                type: "success",
                text1: "Signed Up Successfully 🎉",
                text2: `Welcome aboard, ${user.name}!`,
            });

            router.replace("/(home)/home");

        } catch (error: any) {
            const backendMessage =
                error?.response?.data?.error || error?.error || "Something went wrong";
            Toast.show({
                type: "error",
                text1: "SingUp Failed ❌",
                text2:backendMessage || (error as any).message || 'An error occurred during login',
            })
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/(home)/home");
        }

    }, [isAuthenticated,router]);

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
                    <View className="items-center mt-12 mb-6">
                        <View className="w-20 h-20 bg-brand-500 rounded-2xl items-center justify-center mb-4">
                            <Ionicons name="person-add" size={32} color="white" />
                        </View>
                        <Text className="text-4xl font-serif font-bold text-ink mb-2">
                            Join Our Library
                        </Text>
                        <Text className="text-lg text-gray-600 font-body text-center">
                            Create your account to start exploring
                        </Text>
                    </View>

                    {/* Signup Form */}
                    <View className="space-y-4">
                        {/* Full Name Input */}
                        <View>
                            <Text className="text-base font-body font-medium text-ink mb-2 mt-4">
                                Full Name
                            </Text>
                            <View className="relative">
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter your full name"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="words"
                                    className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body ${
                                        errors.fullName ? 'border-error' : 'border-gray-200'
                                    } focus:border-brand-500`}
                                />
                                <View className="absolute right-4 top-3">
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={errors.fullName ? '#ef4444' : '#9CA3AF'}
                                    />
                                </View>
                            </View>
                            {errors.fullName ? (
                                <Text className="text-error text-sm mt-1 font-body">
                                    {errors.fullName}
                                </Text>
                            ) : null}
                        </View>

                        {/* Email Input */}
                        <View>
                            <Text className="text-base font-body font-medium text-ink mb-2 mt-4">
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
                                    placeholder="Create a password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body pr-12 ${
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

                        {/* Confirm Password Input */}
                        <View>
                            <Text className="text-base font-body font-medium text-ink mb-2 mt-4">
                                Confirm Password
                            </Text>
                            <View className="relative">
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body pr-12 ${
                                        errors.confirmPassword ? 'border-error' : 'border-gray-200'
                                    } focus:border-brand-500`}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-3"
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={errors.confirmPassword ? '#ef4444' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword ? (
                                <Text className="text-error text-sm mt-1 font-body">
                                    {errors.confirmPassword}
                                </Text>
                            ) : null}
                        </View>

                        {/* Terms and Conditions */}
                        <View className="mt-4">
                            <TouchableOpacity
                                onPress={() => setAcceptTerms(!acceptTerms)}
                                className="flex-row items-start"
                            >
                                <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
                                    acceptTerms
                                        ? 'bg-brand-500 border-brand-500'
                                        : errors.terms
                                            ? 'border-error'
                                            : 'border-gray-300'
                                }`}>
                                    {acceptTerms && (
                                        <Ionicons name="checkmark" size={12} color="white" />
                                    )}
                                </View>
                                <Text className="flex-1 text-gray-600 font-body leading-5">
                                    I agree to the{' '}
                                    <Text className="text-brand-600 font-medium">Terms of Service</Text>
                                    {' '}and{' '}
                                    <Text className="text-brand-600 font-medium">Privacy Policy</Text>
                                </Text>
                            </TouchableOpacity>
                            {errors.terms ? (
                                <Text className="text-error text-sm mt-1 font-body ml-8">
                                    {errors.terms}
                                </Text>
                            ) : null}
                        </View>

                        {/* Signup Button */}
                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={isLoading}
                            className={`bg-brand-500 rounded-lg py-4 items-center mt-6 ${
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
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>


                    </View>

                    {/* Login Link */}
                    <View className="flex-row justify-center items-center mt-6 mb-6">
                        <Text className="text-gray-600 font-body">
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={onNavigateToLogin}>
                            <Link href="/Login" className="text-brand-600 font-body font-semibold">
                                Login
                            </Link>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignupScreen;