import React from 'react'
import {Text, View} from "react-native";
import { useLocalSearchParams } from "expo-router";

const Property = () => {
    const {id}= useLocalSearchParams()
    console.log(id)
    return (

            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-lg text-secondary">
                    This is the property details screen.
                </Text>
                <Text className="text-xl font-bold text-primary">
                    Property ID: {id}
                </Text>
            </View>

    )
}
    export default Property
