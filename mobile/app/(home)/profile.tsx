import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import UserBooks from "@/components/UserBooks";
import api from "@/lib/api";

export default function Profile() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [reload, setReload] = useState(false);

    // Forgot/Reset password modal states
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/(auth)/Login");
        }
    }, [isAuthenticated, router]);

    // 1. Call Forgot Password API (send reset email)
    const handleForgotPassword = async () => {
        try {
            setLoading(true);

            const response = await api.post("/user/forgot-password", {
                email: user?.email,
            });

            setForgotModalVisible(true);
            setOtp(response.data.token || "");
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // 2. Call Reset Password API
    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmNewPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await api.post("/user/reset-password", {
                email: user?.email,
                otp,
                newPassword,
            });

            Alert.alert("Success", "Password updated successfully");
            setForgotModalVisible(false);
            setOtp("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const renderProfileHeader = () => (
        <View className="p-4 bg-paper">
            <Text className="text-2xl font-serif font-bold text-leather mb-2">
                {user?.name || "Guest"}
            </Text>
            <Text className="text-gray-600 mb-1">Email: {user?.email}</Text>
            <Text className="text-gray-600 mb-1">
                Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
            </Text>
            <Button title="Update Details" onPress={() => {}} color="#d97706" />
            <View className="mt-3">
                <Button
                    title={loading ? "Sending..." : "Forgot Password"}
                    onPress={handleForgotPassword}
                    color="#6b7280"
                    disabled={loading}
                />
            </View>
            <Text className="text-xl font-bold text-leather mt-6 mb-2">
                Your Uploaded Books
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-paper">
            <FlatList
                data={[{ id: "books-list" }]} // dummy array to trigger render
                keyExtractor={(item) => item.id}
                renderItem={() => <UserBooks reload={reload} />}
                ListHeaderComponent={renderProfileHeader}
                showsVerticalScrollIndicator={false}
            />

            {/* Reset Password Modal */}
            <Modal
                visible={forgotModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setForgotModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-11/12 bg-white p-6 rounded-2xl shadow-lg">
                        <Text className="text-xl font-bold text-leather mb-4">
                            Reset Password
                        </Text>

                        <TextInput
                            placeholder="Enter OTP"
                            value={otp}
                            placeholderTextColor="#6b7280"
                            onChangeText={setOtp}
                            className="border border-gray-300 rounded-lg p-3 mb-3"
                        />
                        <TextInput
                            placeholder="New Password"
                            secureTextEntry
                            placeholderTextColor="#6b7280"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            className="border border-gray-300 rounded-lg p-3 mb-4"
                        />
                        <TextInput
                            placeholder="Confirm New Password"
                            secureTextEntry
                            placeholderTextColor="#6b7280"
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            className="border border-gray-300 rounded-lg p-3 mb-4"
                        />

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setForgotModalVisible(false)}
                                className="px-5 py-3 bg-gray-300 rounded-lg"
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={loading}
                                className="px-5 py-3 bg-amber-500 rounded-lg"
                            >
                                <Text className="text-white font-semibold">
                                    {loading ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
