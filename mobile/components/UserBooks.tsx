import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import UpdateBookModal from "@/components/UpdateBookModal";

dayjs.extend(relativeTime);

interface UserBooksProps {
    refreshTrigger: number;
    onStatsUpdate?: () => void;
}

interface Book {
    _id: string;
    title: string;
    description: string;
    rating: number;
    image?: string;
    createdAt: string;
}

interface Pagination {
    currentPage: number;
    hasNext: boolean;
    totalPages: number;
    totalBooks: number;
}

export default function UserBooks({ refreshTrigger, onStatsUpdate }: UserBooksProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [updateBookid, setUpdateBookId] = useState<number | null>(null);

    // Fetch user books with proper error handling
    const fetchUserBooks = useCallback(
        async (page: number = 1, isRefresh: boolean = false) => {
            // Prevent multiple simultaneous requests
            if (isLoadingMore && !isRefresh) return;
            if (!hasNext && page > 1) return;

            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else if (page === 1) {
                    setLoading(true);
                } else {
                    setIsLoadingMore(true);
                }

                console.log("Fetching books, page:", page);

                const response = await api.get(`/books/my?page=${page}`);
                console.log(response.data)
                const { books: newBooks, pagination }: { books: Book[], pagination: Pagination } = response.data;

                setBooks((prevBooks) => {
                    if (page === 1) {
                        return newBooks;
                    }
                    // Avoid duplicates when loading more
                    const existingIds = prevBooks.map(book => book._id);
                    const filteredNewBooks = newBooks.filter(book => !existingIds.includes(book._id));
                    return [...prevBooks, ...filteredNewBooks];
                });

                setCurrentPage(pagination.currentPage);
                setHasNext(pagination.hasNext);

                // Update parent component stats if callback provided
                if (onStatsUpdate && (page === 1 || isRefresh)) {
                    onStatsUpdate();
                }

            } catch (error: any) {
                console.error('Error fetching books:', error);
                const backendMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong";

                Toast.show({
                    type: "error",
                    text1: "Failed to fetch books",
                    text2: backendMessage,
                });
            } finally {
                setLoading(false);
                setRefreshing(false);
                setIsLoadingMore(false);
            }
        },
        [hasNext, isLoadingMore, onStatsUpdate]
    );

    // Initial load effect
    useEffect(() => {
        fetchUserBooks(1, true);
    }, [refreshTrigger]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNext && !isLoadingMore && !loading && !refreshing) {
            fetchUserBooks(currentPage + 1);
        }
    }, [hasNext, isLoadingMore, loading, refreshing]);

    // Handle book update
    const handleUpdate = useCallback((book: Book) => {
        console.log("Updating book:", book);
        setSelectedBook(book);
        setUpdateBookId(book);
        setModalVisible(true);
    }, []);

    // Handle book deletion
    const handleDelete = useCallback((id: string, title: string) => {
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
                            setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));
                            Toast.show({
                                type: "success",
                                text1: "Book deleted successfully",
                            });

                            // Update parent component stats
                            if (onStatsUpdate) {
                                onStatsUpdate();
                            }
                        } catch (error: any) {
                            console.error('Delete error:', error);
                            Toast.show({
                                type: "error",
                                text1: "Failed to delete book",
                                text2: error?.response?.data?.message || "Please try again",
                            });
                        }
                    },
                },
            ]
        );
    }, [onStatsUpdate]);

    // Handle book update completion
    const handleBookUpdated = useCallback(() => {
        setModalVisible(false);
        setSelectedBook(null);
        fetchUserBooks(1, true); // Refresh the list
    }, [fetchUserBooks]);

    // Handle modal close
    const handleModalClose = useCallback(() => {
        setModalVisible(false);
        setSelectedBook(null);
    }, []);

    // Render stars component
    const renderStars = useMemo(() => (rating: number) => {
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
    }, []);

    // Render individual book item
    const renderBook = useCallback(({ item }: { item: Book }) => (

        <View
            className="mx-4 mb-6 bg-white rounded-xl shadow-lg overflow-hidden"
            style={{
                shadowColor: "#000",
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
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
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
                <View className="mb-4">{renderStars(item.rating)}</View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3 gap-2">
                    <TouchableOpacity
                        onPress={() => handleUpdate(item._id)}
                        className="flex-1 bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                    >
                        <Ionicons name="pencil" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDelete(item._id, item.title)}
                        className="flex-1 bg-red-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                    >
                        <Ionicons name="trash" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    ), [renderStars, handleUpdate, handleDelete]);

    // Render footer component
    const renderFooter = useMemo(() => {
        if (isLoadingMore) {
            return (
                <View className="py-6 items-center">
                    <ActivityIndicator size="large" color="#d97706" />
                    <Text className="text-brand-600 mt-2 font-body">
                        Loading more books...
                    </Text>
                </View>
            );
        }
        return null;
    }, [isLoadingMore]);

    // Render empty component
    const renderEmpty = useMemo(() => {
        if (loading) return null;

        return (
            <View className="flex-1 items-center justify-center px-8 py-16">
                <Ionicons name="library-outline" size={80} color="#d97706" />
                <Text className="text-2xl font-serif text-leather mt-4 text-center">
                    Your Library Awaits
                </Text>
                <Text className="text-ink/70 text-center mt-2 leading-relaxed font-body">
                    Start building your personal collection by adding your first book!
                </Text>
            </View>
        );
    }, [loading]);

    return (
        <View className="flex-1 bg-brand-50">
            <FlatList
                data={books}
                keyExtractor={(item) => item._id}
                renderItem={renderBook}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{
                    paddingTop: 12,
                    paddingBottom: 100,
                    flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
            />

            {/* Update Modal */}
            {selectedBook && (
                <UpdateBookModal
                    id={updateBookid}
                    visible={modalVisible}
                    book={selectedBook}
                    onClose={handleModalClose}
                    onUpdated={handleBookUpdated}
                />
            )}
        </View>
    );
}