import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { api } from "../../services/api";
import { LinearGradient } from 'expo-linear-gradient';

export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        try {
            setLoading(true);
            await api.auth.signup({ name, email, password });
            router.replace("/(tabs)/dashboard");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#000000', '#1A1A1A']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    className="px-6"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="items-center mb-8 mt-4">
                        <Image
                            source={require("../../assets/logo.png")}
                            className="w-24 h-24 mb-6"
                            resizeMode="contain"
                        />
                        <Text className="text-3xl font-bold text-cr-text mb-2 text-center">Create Account</Text>
                        <Text className="text-cr-muted text-lg text-center">Join the royalty of credit management.</Text>
                    </View>

                    <View className="space-y-6">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            autoCapitalize="words"
                            value={name}
                            onChangeText={setName}
                        />

                        <Input
                            label="Email Address"
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <Button
                            title="Create Account"
                            onPress={handleSignup}
                            loading={loading}
                            className="mt-4"
                        />

                        <Text className="text-gray-500 text-xs text-center mt-4">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </Text>
                    </View>

                    <View className="mt-8 mb-6 flex-row justify-center">
                        <Text className="text-cr-muted">Already have an account? </Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-cr-gold font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
