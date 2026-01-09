import { View, Text, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, runOnJS } from "react-native-reanimated";

export default function Pay() {
    const router = useRouter();
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Animation values
    const crownScale = useSharedValue(0);
    const crownOpacity = useSharedValue(0);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            const data = await api.cards.list();
            setCards(data);
            if (data.length > 0) setSelectedCard(data[0]);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePayment = async () => {
        if (!selectedCard || !amount) return;

        try {
            // In real app, we verify funds etc.
            // For MVP, just update balance.

            // NOTE: This API Pay endpoint currently clears whole balance in backend/db logic
            // Ideally we'd patch specific amount, but let's simulate the flow UI mostly.
            await api.cards.pay(selectedCard.id);

            // Trigger Animation
            setShowSuccess(true);
            crownScale.value = withSequence(withSpring(1.5), withTiming(1, { duration: 500 }));
            crownOpacity.value = withTiming(1, { duration: 300 });

            // Reset after delay
            setTimeout(() => {
                setShowSuccess(false);
                router.back();
            }, 2500);

        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const fee = amount ? (parseFloat(amount) * 0.0285).toFixed(2) : "0.00";
    const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(2) : "0.00";

    const crownStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: crownScale.value }],
            opacity: crownOpacity.value
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="flex-1 px-6">
                <View className="flex-row items-center mb-8 mt-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-cr-gold">Reign Pay</Text>
                </View>

                {/* Card Selection */}
                <Text className="text-cr-muted text-sm mb-2 uppercase tracking-wider">Select Card</Text>
                <TouchableOpacity
                    onPress={() => setDropdownVisible(true)}
                    className="flex-row justify-between items-center bg-cr-card p-4 rounded-xl border border-gray-800 mb-6"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="card-outline" size={24} color="#D4AF37" />
                        <Text className="text-white ml-3 font-bold text-lg">
                            {selectedCard ? `${selectedCard.issuer} •••• ${selectedCard.ending_digits}` : "Select a Card"}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                {/* Amount Input */}
                <Text className="text-cr-muted text-sm mb-2 uppercase tracking-wider">Payment Amount</Text>
                <View className="flex-row items-center bg-cr-card p-4 rounded-xl border border-gray-800 mb-2">
                    <Text className="text-3xl font-bold text-cr-gold mr-2">$</Text>
                    <TextInput
                        className="flex-1 text-3xl font-bold text-white h-12"
                        placeholder="0.00"
                        placeholderTextColor="#444"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Fee Breakdown */}
                <View className="bg-gray-900/50 p-4 rounded-lg mb-8">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Processing Fee (2.85%)</Text>
                        <Text className="text-gray-400 font-medium">${fee}</Text>
                    </View>
                    <View className="flex-row justify-between pt-2 border-t border-gray-800">
                        <Text className="text-white font-bold">Total</Text>
                        <Text className="text-white font-bold">${total}</Text>
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    onPress={handlePayment}
                    className="bg-cr-gold w-full p-4 rounded-xl shadow-lg shadow-yellow-900/40 items-center justify-center"
                >
                    <Text className="text-black font-extrabold text-lg uppercase tracking-wide">Send Payment</Text>
                </TouchableOpacity>

                {/* Dropdown Modal */}
                <Modal visible={dropdownVisible} transparent animationType="fade">
                    <TouchableOpacity
                        className="flex-1 bg-black/80 justify-center px-6"
                        activeOpacity={1}
                        onPress={() => setDropdownVisible(false)}
                    >
                        <View className="bg-cr-card rounded-2xl overflow-hidden border border-gray-700">
                            {cards.map(card => (
                                <TouchableOpacity
                                    key={card.id}
                                    className="p-4 border-b border-gray-800 flex-row items-center"
                                    onPress={() => {
                                        setSelectedCard(card);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    <Ionicons name="card" size={20} color="#D4AF37" />
                                    <Text className="text-white ml-3 font-medium text-lg">
                                        {card.issuer} •••• {card.ending_digits}
                                    </Text>
                                    <View className="flex-1 items-end">
                                        <Text className="text-gray-400">${parseFloat(card.balance).toFixed(2)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Success Overlay */}
                {showSuccess && (
                    <View className="absolute inset-0 bg-black/95 justify-center items-center z-50">
                        <Animated.Text style={[{ fontSize: 100 }, crownStyle]}>
                            👑
                        </Animated.Text>
                        <Text className="text-cr-gold text-2xl font-bold mt-8">Payment Successful!</Text>
                        <Text className="text-gray-400 mt-2">Reigning Supreme.</Text>
                    </View>
                )}

            </View>
        </SafeAreaView>
    );
}
