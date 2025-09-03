import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";

const AddBook = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState(0);
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState("");
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                base64: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setImageBase64(result.assets[0].base64 || "");
            }
        } catch (error) {
            Toast.show({ type: "error", text1: "Error picking image" });
        }
    };

    const handleStarPress = (starRating: number) => {
        setRating(starRating);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handleStarPress(i)}
                    className="p-2 mx-1"
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={i <= rating ? "star" : "star-outline"}
                        size={32}
                        color={i <= rating ? "#FFD700" : "#C0C0C0"}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    const handleAddBook = async () => {
        if (!title.trim() || !description.trim() || rating === 0 || !imageBase64) {
            Toast.show({
                type: "error",
                text1: "Missing Information",
                text2: "Please fill all fields and select a rating"
            });
            return;
        }

        if (rating < 1 || rating > 5) {
            Toast.show({
                type: "error",
                text1: "Invalid Rating",
                text2: "Rating must be between 1 and 5 stars"
            });
            return;
        }

        setUploading(true);
        try {
            await api.post("/books/add", {
                title: title.trim(),
                description: description.trim(),
                rating: rating.toString(),
                image: imageBase64
            });
            Toast.show({
                type: "success",
                text1: "Success!",
                text2: "Book added to your library"
            });

            // Reset form
            setTitle("");
            setDescription("");
            setRating(0);
            setImage(null);
            setImageBase64("");

            router.push("/");
        } catch (error: any) {
            console.log(error);
            const backendMessage =
                error?.response?.data?.error || error?.error || "Something went wrong";
            console.log("Backend Error:", backendMessage);
            Toast.show({
                type: "error",
                text1: "Failed to add book",
                text2: backendMessage || "Please try again"
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                className="flex-1 bg-paper"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Header */}
                <View className="pt-12 px-5 pb-8 bg-brand-gradient rounded-b-3xl">
                    <Text className="text-3xl font-serif text-brand-600 text-center mb-2">
                        Add New Book
                    </Text>
                    <Text className="text-base font-body text-brand-400 text-center opacity-90">
                        Share your latest read with the community
                    </Text>
                </View>

                {/* Form */}
                <View className="p-5">
                    {/* Title Input */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold font-body text-leather mb-2">
                            Book Title
                        </Text>
                        <TextInput
                            placeholder="Enter book title"
                            value={title}
                            onChangeText={setTitle}
                            className="border border-brand-300 rounded-xl p-4 bg-paper text-base text-ink font-body shadow-book"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Description Input */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold font-body text-leather mb-2">
                            Description
                        </Text>
                        <TextInput
                            placeholder="What's this book about? Share your thoughts..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            className="border border-brand-300 rounded-xl p-4 bg-paper text-base text-ink font-body h-24 shadow-book"
                            textAlignVertical="top"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Rating */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold font-body text-leather mb-2">
                            Your Rating
                        </Text>
                        <View className="bg-paper border border-brand-300 rounded-xl py-5 px-4 shadow-book">
                            <View className="flex-row justify-center items-center">
                                {renderStars()}
                            </View>
                            {rating > 0 && (
                                <Text className="text-center mt-2 text-sm text-leather font-body opacity-75 italic">
                                    {rating} out of 5 stars
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Image Picker */}
                    <View className="mb-6">
                        <Text className="text-base font-semibold font-body text-leather mb-2">
                            Book Cover
                        </Text>
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-paper border-2 border-dashed border-brand-500 rounded-xl py-5 px-4 mb-4 shadow-book"
                            onPress={pickImage}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera-outline" size={24} color="#d97706" />
                            <Text className="ml-2 text-base text-brand-600 font-medium font-body">
                                {image ? "Change Image" : "Select Image"}
                            </Text>
                        </TouchableOpacity>

                        {image && (
                            <View className="items-center">
                                <Image
                                    source={{ uri: image }}
                                    className="w-full h-64 rounded-xl border border-brand-300 shadow-card"
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 px-6 mt-5 mb-10 shadow-floating ${
                            uploading
                                ? 'bg-gray-400'
                                : 'bg-brand-600 active:bg-brand-700'
                        }`}
                        onPress={handleAddBook}
                        disabled={uploading}
                        activeOpacity={0.8}
                    >
                        {uploading ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator size="small" color="#fff" />
                                <Text className="text-paper text-lg font-semibold font-body ml-2">
                                    Adding Book...
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="book-outline" size={20} color="#fefcf3" />
                                <Text className="text-paper text-lg font-semibold font-body ml-2">
                                    Add to Library
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default AddBook;