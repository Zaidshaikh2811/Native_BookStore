import React from 'react'
import {Image, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export const FeaturedCard = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="w-64 h-80 rounded-2xl border border-gray-200 overflow-hidden shadow-md bg-white relative mr-4"
            activeOpacity={0.9}
        >
            {/* Card Image */}
            <Image
                source={require("../assets/images/logo.png")}
                className="w-full h-full"
                resizeMode="cover"
            />

            {/* Rating Badge */}
            <View className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex-row items-center shadow">
                <Ionicons name="star" size={16} color="gold" />
                <Text className="ml-1 text-sm font-medium text-gray-800">4.4</Text>
            </View>

            {/* Footer Overlay */}
            <View className="absolute bottom-0 left-0 right-0   px-3 py-3 flex-row justify-between items-center">
                <View>
                    <Text className="text-text font-semibold text-base">
                        Modern Apartment
                    </Text>
                    <Text className="text-muted text-sm">$1200 / month</Text>
                </View>
                <TouchableOpacity className="p-2 bg-white/80 rounded-full">
                    <Ionicons name="heart" size={20} color="red" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export const Card = () => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            className="w-full bg-white rounded-xl shadow-md border border-gray-200 flex-row items-center p-4 mb-4"
        >
            {/* Thumbnail */}
            <Image
                source={require("../assets/images/logo.png")}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
            />

            {/* Info Section */}
            <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-gray-900">
                    Luxury Villa
                </Text>
                <Text className="text-sm text-gray-500 mt-1">Los Angeles, CA</Text>
                <Text className="text-sm font-medium text-primary mt-2">
                    $2500 / month
                </Text>
            </View>

            {/* Action Icon */}
            <TouchableOpacity className="p-2 rounded-full bg-gray-100">
                <Ionicons name="arrow-forward" size={20} color="#374151" />
            </TouchableOpacity>
        </TouchableOpacity>
    )
}