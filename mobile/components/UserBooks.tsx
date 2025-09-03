import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Dimensions
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from "@/lib/api";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";

dayjs.extend(relativeTime);

const { width } = Dimensions.get('window');

export default function UserBooks({ reload }: { reload: boolean }) {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);

    const router = useRouter();

    const fetchUserBooks = async (page: number = 1, isRefresh: boolean = false) => {
        if (loading || (!hasNext && !isRefresh)) return;

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await api.get(`/books/my?page=${page}`);
            const { books: newBooks, pagination } = res.data;

            setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));
            setCurrentPage(pagination.currentPage);
            setHasNext(pagination.hasNext);

        } catch (e: any) {
            console.error(e);
            const backendMessage =
                e?.response?.data?.error || e?.error || "Something went wrong";
            Toast.show({
                type: "error",
                text1: "Failed to fetch books",
                text2: backendMessage || "Please try again later"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserBooks(1, true);
    }, [reload]);

    const handleRefresh = () => {
        setCurrentPage(1);
        setHasNext(true);
        fetchUserBooks(1, true);
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            "Delete Book",
            `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/books/${id}`);
                            setBooks((prev) => prev.filter((b) => b._id !== id));
                            Toast.show({
                                type: "success",
                                text1: "Book deleted successfully"
                            });
                        } catch (e: any) {
                            console.error(e);
                            Toast.show({
                                type: "error",
                                text1: "Failed to delete book",
                                text2: "Please try again"
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleUpdate = (id: string) => {
        router.push(`/books/update/${id}`);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Ionicons key={i} name="star" size={14} color="#f59e0b" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Ionicons key={i} name="star-half" size={14} color="#f59e0b" />
                );
            } else {
                stars.push(
                    <Ionicons key={i} name="star-outline" size={14} color="#d1d5db" />
                );
            }
        }

        return (
            <View className="flex-row items-center">
                {stars}
                <Text className="text-gray-500 text-sm ml-2">({rating})</Text>
            </View>
        );
    };

    const renderBook = ({ item, index }: any) => (
        <View
            className="mx-4 mb-6 bg-white rounded-xl shadow-lg overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
            }}
        >
            {/* Book Image with Gradient Overlay */}
            <View className="relative">
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        className="w-full h-48"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-48 bg-gray-200 items-center justify-center">
                        <Ionicons name="book-outline" size={48} color="#9ca3af" />
                    </View>
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    className="absolute bottom-0 left-0 right-0 h-20"
                />

                {/* Time Badge */}
                <View className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-medium">
                        {dayjs(item.createdAt).fromNow()}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View className="p-4">
                <Text
                    className="text-xl font-bold text-gray-800 mb-2 leading-tight"
                    numberOfLines={2}
                >
                    {item.title}
                </Text>

                <Text
                    className="text-gray-600 text-base mb-3 leading-relaxed"
                    numberOfLines={3}
                >
                    {item.description}
                </Text>

                {/* Rating */}
                <View className="mb-4">
                    {renderStars(item.rating)}
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3 gap-2">
                    <TouchableOpacity
                        onPress={() => handleUpdate(item._id)}
                        className="flex-1 bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                        style={{
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Ionicons name="pencil" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDelete(item._id, item.title)}
                        className="flex-1 bg-red-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                        style={{
                            shadowColor: '#ef4444',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <Ionicons name="trash" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-brand-50">
            <FlatList
                data={books}
                keyExtractor={(item) => item._id}
                renderItem={renderBook}
                onEndReached={() => fetchUserBooks(currentPage + 1)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading ? (
                        <View className="py-6 items-center">
                            <ActivityIndicator size="large" color="#d97706" />
                            <Text className="text-brand-600 mt-2 font-body">Loading more books...</Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="flex-1 items-center justify-center px-8 py-16">
                            <Ionicons name="library-outline" size={80} color="#d97706" />
                            <Text className="text-2xl font-serif text-leather mt-4 text-center">
                                Your Library Awaits
                            </Text>
                            <Text className="text-ink/70 text-center mt-2 leading-relaxed font-body">
                                Start building your personal collection by adding your first book!
                            </Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{
                    paddingTop: 12,
                    paddingBottom: 100,
                    flexGrow: 1
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}