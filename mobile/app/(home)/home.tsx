import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, SafeAreaView, StatusBar, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";


export default function Home() {
    const { user, clearAuth, isAuthenticated } = useAuthStore();
    const [books, setBooks] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasNext, setHasNext] = useState(true);
    dayjs.extend(relativeTime);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/(auth)/Login");
        } else {
            fetchBooks(1);
        }
    }, [fetchBooks, isAuthenticated, router]);

    const handleLogout = () => {
        clearAuth();
        router.replace("/(auth)/Login");
    };

    const fetchBooks = async (page: number) => {
        if (loading || !hasNext) return;

        setLoading(true);
        try {
            const response = await api.get(`/books?page=${page}`);
            const { books: newBooks, pagination } = response.data;

            setBooks((prev) => (page === 1 ? newBooks : [...prev, ...newBooks]));
            setCurrentPage(pagination.currentPage);
            setHasNext(pagination.hasNext);

            if (page === 1) {
                Toast.show({
                    type: "success",
                    text1: `Books Loaded 📚`,
                    text2: `${newBooks.length} books found`,
                });
            }
        } catch (e: any) {
            console.error("Error fetching books:", e.message || e);
            const backendMessage =
                e?.response?.data?.message || e?.message || "Something went wrong";
            Toast.show({
                type: "error",
                text1: "Fetch Failed ❌",
                text2:backendMessage || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setCurrentPage(1);
        setHasNext(true);
        await fetchBooks(1);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (hasNext && !loading) {
            fetchBooks(currentPage + 1);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    const renderBook = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => router.push(`/books/${item._id}`)}
            className="mx-4 mb-6 bg-paper rounded-2xl shadow-card overflow-hidden border border-brand-100"
        >
            {/* Book Image */}
            <View className="relative">
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        className="w-full h-64 bg-brand-50"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-64 bg-gradient-to-br from-brand-100 to-brand-200 justify-center items-center">
                        <Ionicons name="book" size={64} color="#d97706" />
                    </View>
                )}

                {/* Rating Badge */}
                <View className="absolute top-4 right-4 bg-leather/90 rounded-xl px-3 py-2 flex-row items-center">
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text className="text-paper text-sm font-semibold ml-1">{item.rating}</Text>
                </View>
            </View>

            {/* Book Details */}
            <View className="p-6">
                <Text className="text-2xl font-serif font-bold text-ink mb-3 leading-tight">
                    {item.title}
                </Text>

                {item.description && (
                    <Text className="text-ink/70 text-base mb-4 leading-relaxed font-body" numberOfLines={3}>
                        {item.description}
                    </Text>
                )}

                {/* User Info */}
                {item.user && (
                    <View className="flex-row items-center mb-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                        <View className="w-12 h-12 bg-brand-500 rounded-full justify-center items-center mr-4">
                            <Text className="text-paper font-bold text-base">
                                {getInitials(item.user.name)}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-ink font-primary">{item.user.name}</Text>
                            <Text className="text-ink/60 text-sm font-body">{item.user.email}</Text>
                        </View>
                    </View>
                )}

                {/* Timestamps */}
                <View className="flex-row justify-between pt-4 border-t border-brand-100">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#92400e" />
                        <Text className="text-leather text-xs ml-2 font-mono">
                            Added {dayjs(item.createdAt).fromNow()}
                        </Text>
                    </View>
                    {item.createdAt !== item.updatedAt && (
                        <View className="flex-row items-center">
                            <Ionicons name="create-outline" size={16} color="#92400e" />
                            <Text className="text-leather text-xs ml-2 font-mono">

                                Updated {dayjs(item.updatedAt).fromNow()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View className="px-4 pb-6 mt-4">
            {/* User Welcome Section */}
            <View className="flex-row items-center justify-between mb-8">
                <View className="flex-1">
                    <Text className="text-2xl font-serif font-bold text-leather mb-2">
                        Welcome back, {user?.name?.split(" ")[0] || "Reader"}
                    </Text>
                    <Text className="text-brand-400 text-sm font-body">
                        Continue your literary journey
                    </Text>
                </View>

                {/* Profile & Logout */}
                <View className="items-center">
                    <View className="w-12 h-12 bg-leather rounded-full justify-center items-center mb-3 shadow-book">
                        <Text className="text-paper font-bold text-xl font-primary">
                            {getInitials(user?.name || "User")}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-error/10 px-4 py-2 rounded-lg border border-error/20"
                    >
                        <Text className="text-error text-sm font-semibold font-primary">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>



            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-2xl font-serif font-bold text-leather">Your Books</Text>
                <View className="h-0.5 flex-1 bg-brand-200 ml-4"></View>
            </View>
        </View>
    );



    const renderFooter = () => {
        if (!loading) return null;

        return (
            <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#d97706" />
                <Text className="text-leather mt-3 font-body">Loading more treasures...</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <StatusBar barStyle="dark-content" backgroundColor="#fefcf3" />

            {books.length === 0 && !loading ? (
                <View className="flex-1">
                    {renderHeader()}

                </View>
            ) : (
                <FlatList
                    data={books}
                    keyExtractor={(item) => item._id}
                    renderItem={renderBook}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={["#d97706"]}
                            tintColor="#d97706"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            )}
        </SafeAreaView>
    );
}