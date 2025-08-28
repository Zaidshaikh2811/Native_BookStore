import React from "react";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const FeaturedCard = ({ onPress }: { onPress: () => void }) => {
    // Responsive card dimensions
    const getCardDimensions = () => {
        if (screenWidth < 600) {
            // Phone: 70% width, aspect ratio based
            return {
                width: screenWidth * 0.7,
                height: screenWidth * 0.85,
            };
        } else if (screenWidth < 900) {
            // Small tablet: 60% width
            return {
                width: screenWidth * 0.6,
                height: screenWidth * 0.7,
            };
        } else {
            // Large tablet/desktop: fixed max size
            return {
                width: Math.min(400, screenWidth * 0.4),
                height: Math.min(480, screenWidth * 0.5),
            };
        }
    };

    const { width: cardWidth, height: cardHeight } = getCardDimensions();
    const isSmallScreen = screenWidth < 600;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ width: cardWidth, height: cardHeight }}
            className="rounded-2xl border border-gray-200 overflow-hidden shadow-md bg-white relative"
            activeOpacity={0.9}
        >
            {/* Card Image */}
            <Image
                source={require("../assets/images/logo.png")}
                style={{ width: cardWidth, height: cardHeight * 0.7 }}
                resizeMode="cover"
            />

            {/* Rating Badge */}
            <View
                className="absolute bg-white rounded-full flex-row items-center shadow"
                style={{
                    top: isSmallScreen ? 12 : 16,
                    right: isSmallScreen ? 12 : 16,
                    paddingHorizontal: isSmallScreen ? 8 : 12,
                    paddingVertical: isSmallScreen ? 4 : 6,
                }}
            >
                <Ionicons
                    name="star"
                    size={isSmallScreen ? 14 : 16}
                    color="gold"
                />
                <Text
                    className="ml-1 font-medium text-gray-800"
                    style={{ fontSize: isSmallScreen ? 12 : 14 }}
                >
                    4.4
                </Text>
            </View>

            {/* Footer Overlay */}
            <View
                className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center bg-black/30"
                style={{
                    paddingHorizontal: isSmallScreen ? 12 : 16,
                    paddingVertical: isSmallScreen ? 12 : 16,
                }}
            >
                <View className="flex-1 mr-3">
                    <Text
                        className="text-white font-semibold"
                        style={{ fontSize: isSmallScreen ? 14 : 16 }}
                        numberOfLines={1}
                    >
                        Modern Apartment
                    </Text>
                    <Text
                        className="text-gray-200"
                        style={{ fontSize: isSmallScreen ? 12 : 14 }}
                        numberOfLines={1}
                    >
                        $1200 / month
                    </Text>
                </View>
                <TouchableOpacity
                    className="bg-white/80 rounded-full"
                    style={{
                        padding: isSmallScreen ? 8 : 10,
                    }}
                >
                    <Ionicons
                        name="heart"
                        size={isSmallScreen ? 16 : 20}
                        color="red"
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

interface CardProps {
    style?: { width?: number };
}

export const Card = ({ style }: CardProps) => {
    const cardWidth = style?.width || screenWidth / 2 - 24;
    const isSmallScreen = screenWidth < 600;
    const isLargeScreen = screenWidth >= 900;

    // Responsive image size (percentage of card width)
    const imageSize = Math.min(
        cardWidth * (isSmallScreen ? 0.35 : 0.4),
        isLargeScreen ? 120 : 100
    );

    // Responsive padding
    const cardPadding = isSmallScreen ? 12 : 16;

    return (
        <TouchableOpacity
            style={{
                width: cardWidth,
                padding: cardPadding,
            }}
            activeOpacity={0.9}
            className="bg-white rounded-xl shadow-md border border-gray-300 flex-row items-center mb-4"
        >
            {/* Thumbnail */}
            <Image
                source={require("../assets/images/logo.png")}
                style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: isSmallScreen ? 8 : 12,
                }}
                resizeMode="cover"
            />

            {/* Info Section */}
            <View
                className="flex-1"
                style={{ marginLeft: isSmallScreen ? 12 : 16 }}
            >
                <Text
                    className="font-semibold text-gray-900"
                    style={{ fontSize: isSmallScreen ? 14 : 16 }}
                    numberOfLines={1}
                >
                    Luxury Villa
                </Text>
                <Text
                    className="text-gray-500"
                    style={{
                        fontSize: isSmallScreen ? 12 : 14,
                        marginTop: isSmallScreen ? 2 : 4,
                    }}
                    numberOfLines={1}
                >
                    Los Angeles, CA
                </Text>
                <Text
                    className="font-medium text-primary"
                    style={{
                        fontSize: isSmallScreen ? 12 : 14,
                        marginTop: isSmallScreen ? 4 : 8,
                    }}
                    numberOfLines={1}
                >
                    $2500 / month
                </Text>
            </View>

            {/* Action Icon */}
            <TouchableOpacity
                className="rounded-full bg-gray-100"
                style={{
                    padding: isSmallScreen ? 6 : 8,
                    marginLeft: isSmallScreen ? 4 : 8,
                }}
            >
                <Ionicons
                    name="arrow-forward"
                    size={isSmallScreen ? 16 : 20}
                    color="#374151"
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};
