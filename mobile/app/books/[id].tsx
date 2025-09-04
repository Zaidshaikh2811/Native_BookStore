import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

export default function BookDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            const res = await api.get(`/books/user/${id}`);
            // Extract the book object from the response
            setBook(res.data.book);
        } catch (e: any) {
            Toast.show({
                type: "error",
                text1: "Failed to load book",
                text2: e?.response?.data?.message || e.message,
            });
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#d97706" style={{ flex: 1 }} />;

    if (!book) return <Text className="text-center mt-8">Book not found</Text>;

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <StatusBar barStyle="dark-content" backgroundColor="#fefcf3" />
            <ScrollView className="p-4">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mb-4 flex-row items-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#92400e" />
                    <Text className="text-leather font-semibold ml-2">Back</Text>
                </TouchableOpacity>

                {/* Book Image */}
                {book.image ? (
                    <Image
                        source={{ uri: book.image }}
                        className="w-full h-64 rounded-2xl mb-6"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-64 bg-brand-100 justify-center items-center rounded-2xl mb-6">
                        <Ionicons name="book" size={64} color="#d97706" />
                    </View>
                )}

                {/* Book Title & Description */}
                <Text className="text-3xl font-bold text-leather mb-4">{book.title}</Text>
                {book.description && (
                    <Text className="text-ink/80 text-base mb-6">{book.description}</Text>
                )}

                {/* Author / User Info */}
                {book.user && (
                    <View className="p-4 bg-brand-50 rounded-xl mb-6 border border-brand-100">
                        <Text className="font-semibold text-ink">{book.user.name}</Text>
                        <Text className="text-ink/60 text-sm">{book.user.email}</Text>
                    </View>
                )}

                {/* Rating & Timestamps */}
                <Text className="text-ink/60 text-sm mb-1">Rating: {book.rating} ⭐</Text>
                <Text className="text-ink/60 text-sm mb-1">
                    Added: {dayjs(book.createdAt).format("DD MMM YYYY, hh:mm A")}
                </Text>
                {book.createdAt !== book.updatedAt && (
                    <Text className="text-ink/60 text-sm">
                        Updated: {dayjs(book.updatedAt).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
