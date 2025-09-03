import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import * as Linking from "expo-linking";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/lib/api";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();
    const params = useLocalSearchParams();

    // Capture token from deep link (myapp://reset-password?token=XYZ)
    useEffect(() => {
        if (params.token) {
            setToken(params.token);
        } else {
            Linking.getInitialURL().then((url) => {
                if (url) {
                    const { queryParams } = Linking.parse(url);
                    if (queryParams?.token) {
                        setToken(queryParams.token);
                    }
                }
            });
        }
    }, [params]);

    const handleReset = async () => {
        try {
            const res = await api.get("/user/reset-password",{
                params: { token, newPassword }
            });



        } catch (err) {
            Alert.alert("Error", "Something went wrong");
        }
    };

    return (
        <View className="flex-1 justify-center p-4">
            <Text className="text-xl mb-4">Reset Password</Text>
            <TextInput
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="border p-2 rounded mb-4"
            />
            <Button title="Reset Password" onPress={handleReset} />
        </View>
    );
}