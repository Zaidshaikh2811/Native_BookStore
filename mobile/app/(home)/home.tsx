import { View, Text, Button } from "react-native";

import { useRouter } from "expo-router";
import {useAuthStore} from "@/store/authStore";
import api from "@/lib/api";
import {useEffect, useState} from "react";
import Toast from "react-native-toast-message";

export default function Home() {
    const { user, clearAuth ,isAuthenticated } = useAuthStore();
    const [books, setBooks] = useState()
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
            const books = response.data;
            setBooks(books);

            console.log("Fetched books:", books);

            Toast.show({
                type: "success",
                text1: "Books Loaded 📚",
                text2: `${books.length} books fetched successfully`,
            });
        }catch(e: any){

            console.error("Error fetching books:", e.message || e);

            Toast.show({
                type: "error",
                text1: "Fetch Failed ❌",
                text2: e.message || "Something went wrong",
            });

            return [];
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


