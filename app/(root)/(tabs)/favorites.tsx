import React from 'react'
import {Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const Favorites = () => {
    return (
        <SafeAreaView className="flex-1 bg-background">

        <View className="flex-1">
            <View className="flex-1 items-center justify-center bg-background">
                <View className="bg-surface p-6 rounded-lg shadow-card">
                    <Text className="text-text font-sans text-lg mb-2">Favorites Screen</Text>
                    <Text className="text-textMuted text-base">This is the favorites screen.</Text>
                </View>
            </View>
        </View>

        </SafeAreaView>
    )
}
export default Favorites
