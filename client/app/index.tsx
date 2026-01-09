import { View, Text, Image, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";

export default function Landing() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                className="px-6"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center mb-12">
                    <Image
                        source={require("../assets/logo.png")}
                        className="w-24 h-24 mb-6"
                        resizeMode="contain"
                    />
                    <Text className="text-4xl font-extrabold text-cr-text text-center leading-tight">
                        Take the wheel on your <Text className="text-cr-gold">credit</Text>
                    </Text>
                    <Text className="text-cr-muted text-center text-lg mt-4 px-4 leading-relaxed">
                        Track payments, optimize utilization, and conquer debt with CardReign.
                    </Text>
                </View>

                <View className="space-y-4">
                    <Button
                        title="Get Started"
                        onPress={() => router.push("/auth/signup")}
                    />
                    <Button
                        title="I have an account"
                        variant="outline"
                        onPress={() => router.push("/auth/login")}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
