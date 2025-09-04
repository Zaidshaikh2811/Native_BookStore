import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    Image, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";
import Toast from "react-native-toast-message";

interface UpdateBookModalProps {
    id: string;
    visible: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export default function UpdateBookModal({
                                            id,
                                            visible,
                                            onClose,
                                            onUpdated,
                                        }: UpdateBookModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState("0");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch book details when modal opens
    useEffect(() => {
        if (!visible) return;

        const fetchBook = async () => {
            try {
                setLoading(true);
                console.log(`Fetching book with id: ${id}`);
                const res = await api.get(`/books/user/${id}`);
                console.log(res.data)
                const book = res.data.book;

                setTitle(book.title);
                setDescription(book.description);
                setRating(String(book.rating || 0));
                setImage(book.image || null);
            } catch (err) {
                console.error(err);
                Toast.show({
                    type: "error",
                    text1: "Failed to load book",
                    text2: "Please try again later",
                });
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, visible]);

    // Pick image from gallery
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    // Handle book update
    const handleUpdate = async () => {
        if (!title || !description) {
            Alert.alert("Validation Error", "Title and description are required");
            return;
        }

        try {
            setSaving(true);
            await api.put(`/books/${id}`, {
                title,
                description,
                rating: parseFloat(rating) || 0,
                image,
            });

            Toast.show({
                type: "success",
                text1: "Book updated successfully",
            });

            onUpdated();
            onClose();
        } catch (err) {
            console.error(err);
            Toast.show({
                type: "error",
                text1: "Failed to update book",
                text2: "Please try again later",
            });
        } finally {
            setSaving(false);
        }
    };

    if (!visible) return null;

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-paper">
                <ActivityIndicator size="large" color="#d97706" />
                <Text className="text-brand-600 mt-2 font-body">
                    Loading book details...
                </Text>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            transparent={true}
        >
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <ScrollView
                    className="w-full bg-white rounded-xl p-6"
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    <Text className="text-2xl font-bold text-gray-800 mb-6">
                        Update Book
                    </Text>

                    {loading ? (
                        <View className="flex-1 justify-center items-center py-20">
                            <ActivityIndicator size="large" color="#d97706" />
                            <Text className="text-gray-700 mt-2">Loading book details...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Title */}
                            <Text className="text-gray-600 mb-1">Title</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter book title"
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                            />

                            {/* Description */}
                            <Text className="text-gray-600 mb-1">Description</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter book description"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                            />

                            {/* Rating */}
                            <Text className="text-gray-600 mb-1">Rating (0-5)</Text>
                            <TextInput
                                value={rating}
                                onChangeText={setRating}
                                placeholder="Rating"
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                            />

                            {/* Image Picker */}
                            <Text className="text-gray-600 mb-2">Book Cover</Text>
                            {image ? (
                                <Image
                                    source={{ uri: image }}
                                    className="w-full h-48 rounded-lg mb-4"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-48 bg-gray-200 items-center justify-center mb-4 rounded-lg">
                                    <Ionicons name="image-outline" size={40} color="#9ca3af" />
                                </View>
                            )}
                            <TouchableOpacity
                                onPress={pickImage}
                                className="bg-gray-100 py-3 rounded-lg flex-row items-center justify-center mb-6"
                            >
                                <Ionicons name="image" size={18} color="#374151" />
                                <Text className="ml-2 text-gray-700 font-medium">
                                    Choose Image
                                </Text>
                            </TouchableOpacity>

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={handleUpdate}
                                disabled={saving}
                                className="bg-orange-500 py-4 rounded-lg flex-row items-center justify-center mb-3"
                            >
                                {saving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="white" />
                                        <Text className="text-white font-semibold ml-2">
                                            Save Changes
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-gray-300 py-4 rounded-lg flex-row items-center justify-center"
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>

    );
}
