import "../global.css";
import { Slot } from "expo-router";
import { View } from "react-native";

export default function Layout() {
    console.log("Layout Mounting...");
    return (
        <View className="flex-1 bg-cr-black">
            <Slot />
        </View>
    );
}
