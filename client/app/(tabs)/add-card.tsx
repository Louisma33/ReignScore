import { View, Text, Switch, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useState } from "react";
import { useRouter } from "expo-router";
import { api } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function AddCard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [issuer, setIssuer] = useState("");
    const [limit, setLimit] = useState("");
    const [endingDigits, setEndingDigits] = useState("");
    const [dueDay, setDueDay] = useState("");

    const handleSave = async () => {
        if (!issuer || !limit || !endingDigits || !dueDay) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await api.cards.add({
                issuer,
                limit_amount: parseFloat(limit),
                ending_digits: endingDigits,
                due_day: parseInt(dueDay),
            });
            Alert.alert("Success", "Card added successfully", [
                { text: "OK", onPress: () => router.push("/(tabs)/dashboard") }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add card");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="flex-row items-center px-6 pt-4 mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-cr-text">Add New Card</Text>
            </View>

            <View className="flex-1 px-6">
                <View className="space-y-6">
                    <Input
                        label="Card Nickname"
                        placeholder="e.g. Chase Sapphire"
                        placeholderTextColor="#525252"
                        value={issuer}
                        onChangeText={setIssuer}
                    />
                    <Input
                        label="Credit Limit"
                        placeholder="10000"
                        keyboardType="numeric"
                        placeholderTextColor="#525252"
                        value={limit}
                        onChangeText={setLimit}
                    />

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input
                                label="Last 4 Digits"
                                placeholder="1234"
                                maxLength={4}
                                keyboardType="numeric"
                                placeholderTextColor="#525252"
                                value={endingDigits}
                                onChangeText={setEndingDigits}
                            />
                        </View>
                        <View className="flex-1">
                            <Input
                                label="Statement Day"
                                placeholder="15"
                                maxLength={2}
                                keyboardType="numeric"
                                placeholderTextColor="#525252"
                                value={dueDay}
                                onChangeText={setDueDay}
                            />
                        </View>
                    </View>

                    <Button
                        title={loading ? "Saving..." : "Save Card"}
                        onPress={handleSave}
                        className="mt-6"
                        disabled={loading}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
