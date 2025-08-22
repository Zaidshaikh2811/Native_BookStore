import { Text, View } from "react-native";
import "../../global.css"
import {Link} from "expo-router";
export default function Index() {
  return (
      <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-xl font-bold text-primary">
              Welcome to Nativewind!
          </Text>

            <Text className="text-lg text-secondary">
                This is the home screen.
            </Text>

            <Link href="/sign-in" className="text-blue-500 mt-4">
                Go to Sign In
            </Link>
            <Link href="/explore" className="text-blue-500 mt-4">
                Go to Explore
            </Link>
            <Link href="/profile" className="text-blue-500 mt-4">
                Go to Profile
            </Link>
            <Link href="/properties/123" className="text-blue-500 mt-4">
                Go to Property 123
            </Link>


      </View>
  );
}
