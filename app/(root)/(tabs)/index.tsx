import { FlatList, Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import Search from "@/components/Search";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, FeaturedCard } from "@/components/Card";
import Filters from "@/components/Filters";

export default function Index() {
    const user = {
        name: "John Doe",
        email: "john.doe@email.com",
        avatar: require("../../../assets/images/logo.png"),
    };

    const cards = Array.from({ length: 8 });
    const featured = [1, 2, 3];

    // Get screen dimensions
    const { width: screenWidth } = Dimensions.get("window");

    // Responsive column calculation
    const getNumColumns = () => {
        if (screenWidth < 600) return 2; // phones
        if (screenWidth < 900) return 3; // small tablets
        return 4; // large tablets/desktop
    };

    const numColumns = getNumColumns();

    // Responsive padding and spacing
    const horizontalPadding = screenWidth < 600 ? 16 : 24;
    const cardSpacing = screenWidth < 600 ? 12 : 16;

    // Calculate card width with proper spacing
    const cardWidth = (screenWidth - (horizontalPadding * 2) - (cardSpacing * (numColumns - 1))) / numColumns;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
            <FlatList
                data={cards}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => <Card style={{ width: cardWidth }} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 24,
                    paddingHorizontal: horizontalPadding
                }}
                numColumns={numColumns}
                key={numColumns} // Force re-render when columns change
                columnWrapperStyle={
                    numColumns > 1 ? {
                        justifyContent: "space-between",
                        marginBottom: cardSpacing
                    } : undefined
                }
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View className="flex-row items-center justify-between pt-4 pb-2">
                            <View className="flex-row items-center gap-3 flex-1 mr-4">
                                <Image
                                    source={user.avatar}
                                    style={{
                                        width: screenWidth < 600 ? 48 : 56,
                                        height: screenWidth < 600 ? 48 : 56,
                                    }}
                                    className="rounded-full border-2 border-primary shadow"
                                    resizeMode="cover"
                                />
                                <View className="flex-1">
                                    <Text
                                        className="font-semibold text-gray-900"
                                        style={{ fontSize: screenWidth < 600 ? 18 : 20 }}
                                        numberOfLines={1}
                                    >
                                        Hi, {user.name.split(" ")[0]} 👋
                                    </Text>
                                    <Text
                                        className="text-gray-500"
                                        style={{ fontSize: screenWidth < 600 ? 14 : 16 }}
                                        numberOfLines={1}
                                    >
                                        {user.email}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                className="rounded-full bg-gray-100"
                                style={{
                                    padding: screenWidth < 600 ? 8 : 12,
                                }}
                            >
                                <Ionicons
                                    name="notifications-outline"
                                    size={screenWidth < 600 ? 20 : 24}
                                    color="#374151"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={{ marginTop: screenWidth < 600 ? 20 : 24 }}>
                            <Search />
                        </View>

                        {/* Featured Section */}
                        <View
                            className="flex-row items-center justify-between"
                            style={{ marginTop: screenWidth < 600 ? 24 : 32 }}
                        >
                            <Text
                                className="font-semibold text-gray-900"
                                style={{ fontSize: screenWidth < 600 ? 18 : 20 }}
                            >
                                Featured Properties
                            </Text>
                            <TouchableOpacity>
                                <Text
                                    className="font-medium text-primary"
                                    style={{ fontSize: screenWidth < 600 ? 14 : 16 }}
                                >
                                    See All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            horizontal
                            data={featured}
                            keyExtractor={(item) => item.toString()}
                            renderItem={() => <FeaturedCard onPress={() => {}} />}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: horizontalPadding,
                                paddingTop: 16
                            }}
                            ItemSeparatorComponent={() => (
                                <View style={{ width: screenWidth < 600 ? 12 : 16 }} />
                            )}
                        />

                        {/* Recommended Section */}
                        <View
                            className="flex-row items-center justify-between"
                            style={{ marginTop: screenWidth < 600 ? 32 : 40 }}
                        >
                            <Text
                                className="font-semibold text-gray-900"
                                style={{ fontSize: screenWidth < 600 ? 18 : 20 }}
                            >
                                Recommended For You
                            </Text>
                            <TouchableOpacity>
                                <Text
                                    className="font-medium text-primary"
                                    style={{ fontSize: screenWidth < 600 ? 14 : 16 }}
                                >
                                    See All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filters */}
                        <Filters />
                    </>
                }
            />
        </SafeAreaView>
    );
}
