import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await api.auth.me();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleSignOut = async () => {
        // Here you might want to call a logout API if you had one, 
        // or just clear the token client-side
        // await api.clearToken(); // If you exposed this
        router.replace("/");
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="flex-1 px-6 pt-4">
                <Text className="text-2xl font-bold text-cr-text mb-8">Settings</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#D4AF37" />
                ) : user ? (
                    <View className="bg-cr-card p-6 rounded-xl border border-gray-800 mb-8">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 rounded-full bg-cr-gold items-center justify-center mr-4">
                                <Text className="text-cr-black font-bold text-xl">
                                    {user.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-cr-text text-lg font-bold">{user.name}</Text>
                                <Text className="text-cr-muted">{user.email}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Text className="text-cr-muted mb-8">Could not load user profile.</Text>
                )}

                <View>
                    <Button
                        title="Sign Out"
                        variant="outline"
                        onPress={handleSignOut}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
