import React, { useState } from 'react';
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import api from "@/lib/api";
import Toast from "react-native-toast-message";

interface ForgotPasswordProps {
    visible: boolean;
    onClose: () => void;
    userEmail?: string; // Optional - if provided, skip email input
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
                                                           visible,
                                                           onClose,
                                                           userEmail
                                                       }) => {
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState(userEmail || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset component state when modal closes
    const handleClose = () => {
        setStep(userEmail ? 'otp' : 'email');
        setEmail(userEmail || '');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setLoading(false);
        onClose();
    };

    // Step 1: Request password reset
    const handleRequestReset = async () => {
        if (!email.trim()) {
            Toast.show({
                type: "error",
                text1: "Email Required",
                text2: "Please enter your email address",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/user/forgot-password", { email });

            Toast.show({
                type: "success",
                text1: "OTP Sent ✅",
                text2: "Check your email for the reset code",
            });

            setStep('otp');
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to send reset email";
            Toast.show({
                type: "error",
                text1: "Error",
                text2: message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset password with OTP
    const handleResetPassword = async () => {
        if (!otp.trim()) {
            Toast.show({
                type: "error",
                text1: "OTP Required",
                text2: "Please enter the verification code",
            });
            return;
        }

        if (!newPassword.trim() || !confirmNewPassword.trim()) {
            Toast.show({
                type: "error",
                text1: "Password Required",
                text2: "Please fill in all password fields",
            });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Toast.show({
                type: "error",
                text1: "Password Mismatch",
                text2: "Passwords do not match",
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Password must be at least 6 characters",
            });
            return;
        }

        try {
            setLoading(true);
            await api.post("/user/reset-password", {
                email,
                otp,
                newPassword,
            });

            Toast.show({
                type: "success",
                text1: "Password Updated ✅",
                text2: "Your password has been changed successfully",
            });

            handleClose();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to reset password";
            Toast.show({
                type: "error",
                text1: "Reset Failed",
                text2: message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize step based on userEmail prop
    React.useEffect(() => {
        if (visible) {
            setStep(userEmail ? 'otp' : 'email');
            if (userEmail) {
                // Auto-trigger OTP request for logged-in users
                handleRequestReset();
            }
        }
    }, [visible, userEmail]);

    const renderEmailStep = () => (
        <View>
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="mail-outline" size={32} color="#d97706" />
                </View>
                <Text className="text-2xl font-serif font-bold text-leather mb-2">
                    Forgot Password?
                </Text>
                <Text className="text-ink/70 text-center font-body">
                    Enter your email address and we'll send you a verification code
                </Text>
            </View>

            <View className="mb-6">
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
                        className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-base font-body focus:border-brand-500"
                    />
                    <View className="absolute right-4 top-3">
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    </View>
                </View>
            </View>

            <View className="flex-row space-x-3">
                <TouchableOpacity
                    onPress={handleClose}
                    className="flex-1 bg-gray-100 rounded-lg py-4 items-center"
                >
                    <Text className="text-gray-700 font-body font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleRequestReset}
                    disabled={loading}
                    className="flex-1 bg-brand-500 rounded-lg py-4 items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-body font-semibold">Send Code</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderOtpStep = () => (
        <View>
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="key-outline" size={32} color="#d97706" />
                </View>
                <Text className="text-2xl font-serif font-bold text-leather mb-2">
                    Enter Verification Code
                </Text>
                <Text className="text-ink/70 text-center font-body">
                    We sent a code to {email}
                </Text>
            </View>

            <View className="mb-6">
                <Text className="text-base font-body font-medium text-ink mb-2">
                    Verification Code
                </Text>
                <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-base font-body focus:border-brand-500 text-center tracking-widest"
                />
            </View>

            <TouchableOpacity
                onPress={() => setStep('password')}
                disabled={!otp.trim()}
                className={`rounded-lg py-4 items-center mb-4 ${
                    otp.trim() ? 'bg-brand-500' : 'bg-gray-300'
                }`}
            >
                <Text className={`font-body font-semibold ${
                    otp.trim() ? 'text-white' : 'text-gray-500'
                }`}>
                    Continue
                </Text>
            </TouchableOpacity>

            <View className="flex-row justify-between">
                <TouchableOpacity onPress={() => setStep('email')}>
                    <Text className="text-brand-600 font-body">← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRequestReset}>
                    <Text className="text-brand-600 font-body">Resend Code</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderPasswordStep = () => (
        <View>
            <View className="items-center mb-6">
                <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="lock-closed-outline" size={32} color="#d97706" />
                </View>
                <Text className="text-2xl font-serif font-bold text-leather mb-2">
                    Set New Password
                </Text>
                <Text className="text-ink/70 text-center font-body">
                    Choose a strong password for your account
                </Text>
            </View>

            <View className="space-y-4 mb-6">
                <View>
                    <Text className="text-base font-body font-medium text-ink mb-2">
                        New Password
                    </Text>
                    <View className="relative">
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-base font-body pr-12 focus:border-brand-500"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3"
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Text className="text-base font-body font-medium text-ink mb-2">
                        Confirm Password
                    </Text>
                    <View className="relative">
                        <TextInput
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-base font-body pr-12 focus:border-brand-500"
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3"
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="flex-row space-x-3">
                <TouchableOpacity
                    onPress={() => setStep('otp')}
                    className="flex-1 bg-gray-100 rounded-lg py-4 items-center"
                >
                    <Text className="text-gray-700 font-body font-semibold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    className="flex-1 bg-brand-500 rounded-lg py-4 items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-body font-semibold">Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="w-full max-w-sm bg-paper rounded-2xl shadow-floating">
                        <ScrollView
                            className="p-6"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {step === 'email' && renderEmailStep()}
                            {step === 'otp' && renderOtpStep()}
                            {step === 'password' && renderPasswordStep()}
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ForgotPassword;