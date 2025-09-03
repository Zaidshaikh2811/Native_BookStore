

import {  Stack} from "expo-router";
import {useAuthStore} from "@/store/authStore";

export default function RootLayout() {
    const {isAuthenticated , user} = useAuthStore();
    console.log(isAuthenticated);
    console.log(user);


    return  (   <Stack screenOptions={{ headerShown: false }}>



            <Stack.Screen name="Login"  options={{
                title: "Login",
                headerShown: false,
                animation: "slide_from_left",
            }} />
            <Stack.Screen name="SignUp"  options={{
                title: "Login",
                headerShown: false,
                animation: "slide_from_right",
            }} />

        </Stack>
    )
}
