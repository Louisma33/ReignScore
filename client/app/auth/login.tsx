import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { api } from "../../services/api";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await api.auth.login({ email, password });
            router.replace("/(tabs)/dashboard");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="flex-1 px-6 pt-10">
                <View className="mb-10">
                    <Text className="text-3xl font-bold text-cr-text mb-2">Welcome Back</Text>
                    <Text className="text-cr-muted text-lg">Sign in to continue your reign.</Text>
                </View>

                <View className="space-y-6">
                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View>
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity className="self-end mt-2">
                            <Text className="text-cr-gold font-medium">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        className="mt-4"
                    />
                </View>

                <View className="flex-1 justify-end mb-8">
                    <View className="flex-row justify-center">
                        <Text className="text-cr-muted">Don't have an account? </Text>
                        <Link href="/auth/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-cr-gold font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
