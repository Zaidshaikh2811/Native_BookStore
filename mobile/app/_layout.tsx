import {Stack} from "expo-router";

import Toast from "react-native-toast-message";
import {SafeAreaView} from "react-native";





export default function RootLayout() {
    return(

            <SafeAreaView className="flex-1">
                    <Stack screenOptions={{ headerShown: false }} >
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(home)" options={{ headerShown: false }} />
                    </Stack>
                <Toast />
            </SafeAreaView>

    )
}

