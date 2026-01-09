import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { api } from "../services/api";

export default function AddCard() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [issuer, setIssuer] = useState("");
    const [endingDigits, setEndingDigits] = useState("");
    const [balance, setBalance] = useState("");
    const [limit, setLimit] = useState("");
    const [dueDay, setDueDay] = useState("");

    const handleAddCard = async () => {
        try {
            if (!issuer || !endingDigits || !limit || !dueDay) {
                alert("Please fill in all required fields");
                return;
            }

            setLoading(true);
            await api.cards.add({
                issuer,
                ending_digits: endingDigits,
                balance: parseFloat(balance) || 0,
                limit_amount: parseFloat(limit),
                due_day: parseInt(dueDay),
            });

            router.back();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="flex-1 px-6 pt-4">
                <Text className="text-2xl font-bold text-cr-text mb-6">Add New Card</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="space-y-4 pb-8">
                        <Input
                            label="Card Issuer"
                            placeholder="e.g. Chase Sapphire"
                            value={issuer}
                            onChangeText={setIssuer}
                        />

                        <Input
                            label="Ending Digits (Last 4)"
                            placeholder="e.g. 4242"
                            keyboardType="numeric"
                            maxLength={4}
                            value={endingDigits}
                            onChangeText={setEndingDigits}
                        />

                        <View className="flex-row space-x-4">
                            <View className="flex-1">
                                <Input
                                    label="Current Balance"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={balance}
                                    onChangeText={setBalance}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label="Credit Limit"
                                    placeholder="5000.00"
                                    keyboardType="numeric"
                                    value={limit}
                                    onChangeText={setLimit}
                                />
                            </View>
                        </View>

                        <Input
                            label="Due Day (1-31)"
                            placeholder="e.g. 15"
                            keyboardType="numeric"
                            maxLength={2}
                            value={dueDay}
                            onChangeText={setDueDay}
                        />

                        <Button
                            title="Add Card"
                            onPress={handleAddCard}
                            loading={loading}
                            className="mt-6"
                        />

                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => router.back()}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
