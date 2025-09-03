import { View, Text, Button } from "react-native";

import { useRouter } from "expo-router";
import {useAuthStore} from "@/store/authStore";
import api from "@/lib/api";
import {useEffect} from "react";

export default function Home() {
    const { user, clearAuth ,isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if(!isAuthenticated){
            router.replace("/(auth)/Login");
        }
    }, [isAuthenticated, router]);

    const handleLogout = () => {
        clearAuth();
        router.replace("/(auth)/Login");
    };

    const fetchBooks = async () => {
        try{


            const response = await api.get("/books");
            console.log(response);

        }catch(e){
            console.log(e)

        }
    }


    return (
        <View  >
            <Text  >Welcome, {user?.name || "Guest"}!</Text>
            <Text >Your email: {user?.email}</Text>

            <Button title="Logout" onPress={handleLogout} />
            <Button title="fetchBooks" onPress={fetchBooks} />
        </View>
    );
}


