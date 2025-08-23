import { Text, View } from "react-native";
import "../../global.css"
import {Link} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import Search from "@/components/Search";
export default function Index() {
  return (

 <SafeAreaView>
<Search/>

 </SafeAreaView>
  );
}
