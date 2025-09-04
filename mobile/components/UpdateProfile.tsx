import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Toast from "react-native-toast-message";

interface UpdateProfileProps {
    visible: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({
                                                         visible,
                                                         onClose,
                                                         onUpdated
                                                     }) => {
    const { user, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ name: '', email: '' });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setName(user?.name || '');
            setEmail(user?.email || '');
            setErrors({ name: '', email: '' });
        }
    }, [visible, user]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleUpdate = async () => {
        setErrors({ name: '', email: '' });

        // Validation
        let hasErrors = false;
        const newErrors = { name: '', email: '' };

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            hasErrors = true;
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
            hasErrors = true;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            hasErrors = true;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        // Check if anything changed
        if (name.trim() === user?.name && email.trim() === user?.email) {
            Toast.show({
                type: "info",
                text1: "No Changes",
                text2: "No changes were made to your profile",
            });
            onClose();
            return;
        }

        setLoading(true);

        try {
            const response = await api.put('/user/profile', {
                name: name.trim(),
                email: email.trim(),
            });

            if (response.data && response.data.user) {
                // Update user in auth store
                updateUser(response.data.user);

                Toast.show({
                    type: "success",
                    text1: "Profile Updated",
                    text2: "Your profile has been updated successfully",
                });

                onUpdated?.();
                onClose();
            }
        } catch (error: any) {
            console.error('Profile update error:', error);

            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to update profile";

            // Handle specific validation errors
            if (error?.response?.data?.field === 'email') {
                setErrors(prev => ({ ...prev, email: errorMessage }));
            } else if (error?.response?.data?.field === 'name') {
                setErrors(prev => ({ ...prev, name: errorMessage }));
            } else {
                Toast.show({
                    type: "error",
                    text1: "Update Failed",
                    text2: errorMessage,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return; // Prevent closing while loading
        onClose();
    };

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
                            {/* Header */}
                            <View className="items-center mb-6">
                                <View className="w-16 h-16 bg-brand-100 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="person-outline" size={32} color="#d97706" />
                                </View>
                                <Text className="text-2xl font-serif font-bold text-leather mb-2">
                                    Update Profile
                                </Text>
                                <Text className="text-ink/70 text-center font-body">
                                    Update your personal information
                                </Text>
                            </View>

                            {/* Form */}
                            <View className="space-y-4">
                                {/* Name Input */}
                                <View>
                                    <Text className="text-base font-body font-medium text-ink mb-2">
                                        Full Name
                                    </Text>
                                    <View className="relative">
                                        <TextInput
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Enter your full name"
                                            placeholderTextColor="#9CA3AF"
                                            autoCapitalize="words"
                                            autoCorrect={false}
                                            className={`bg-white border-2 rounded-lg px-4 py-3 text-base font-body ${
                                                errors.name ? 'border-error' : 'border-gray-200'
                                            } focus:border-brand-500`}
                                        />
                                        <View className="absolute right-4 top-3">
                                            <Ionicons
                                                name="person-outline"
                                                size={20}
                                                color={errors.name ? '#ef4444' : '#9CA3AF'}
                                            />
                                        </View>
                                    </View>
                                    {errors.name ? (
                                        <Text className="text-error text-sm mt-1 font-body">
                                            {errors.name}
                                        </Text>
                                    ) : null}
                                </View>

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
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row space-x-3 mt-8">
                                <TouchableOpacity
                                    onPress={handleClose}
                                    disabled={loading}
                                    className={`flex-1 bg-gray-100 rounded-lg py-4 items-center ${
                                        loading ? 'opacity-50' : ''
                                    }`}
                                >
                                    <Text className="text-gray-700 font-body font-semibold">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    disabled={loading}
                                    className={`flex-1 bg-brand-500 rounded-lg py-4 items-center ${
                                        loading ? 'opacity-70' : ''
                                    }`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-body font-semibold">
                                            Update Profile
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default UpdateProfile;