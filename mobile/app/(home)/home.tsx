import { View, Text, Button, StyleSheet } from "react-native";

import { useRouter } from "expo-router";
import {useAuthStore} from "@/store/authStore";

export default function Home() {
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.replace("/(auth)/Login"); // redirect to login
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.name || "Guest"}!</Text>
            <Text style={styles.subtitle}>Your email: {user?.email}</Text>

            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
    },
});
