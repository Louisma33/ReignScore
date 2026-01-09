import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CreditCard } from "../../components/CreditCard";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";

export default function Dashboard() {
    const router = useRouter();
    const [cards, setCards] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCards = async () => {
        try {
            const data = await api.cards.list();
            setCards(data);
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCards();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCards();
        setRefreshing(false);
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await api.cards.delete(id);
            fetchCards();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <ScrollView
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#D4AF37" // cr-gold
                        colors={["#D4AF37"]}
                    />
                }
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-cr-muted text-lg">Good Morning,</Text>
                        <Text className="text-2xl font-bold text-cr-text">User</Text>
                    </View>
                    <View className="flex-row space-x-4">
                        <TouchableOpacity onPress={() => router.push("/add-card")} className="bg-cr-card border border-cr-gold p-2 rounded-full shadow-sm">
                            <Ionicons name="add" size={24} color="#D4AF37" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/notifications")} className="bg-cr-card border border-gray-800 p-2 rounded-full shadow-sm">
                            <Ionicons name="notifications-outline" size={24} color="#A0A0A0" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Card List */}
                <View className="pb-24">
                    {cards.length === 0 ? (
                        <View className="items-center mt-20">
                            <Text className="text-cr-muted text-center mb-4">No cards visible.</Text>
                            <TouchableOpacity onPress={() => router.push("/add-card")} className="bg-cr-gold px-6 py-3 rounded-lg">
                                <Text className="text-cr-black font-bold">Add Your First Card</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        cards.map((card) => (
                            <TouchableOpacity
                                key={card.id}
                                onLongPress={() => handleDelete(card.id)}
                                delayLongPress={500}
                                activeOpacity={0.9}
                            >
                                <CreditCard
                                    issuer={card.issuer}
                                    endingDigits={card.ending_digits}
                                    balance={parseFloat(card.balance)}
                                    limit={parseFloat(card.limit_amount)}
                                    dueDate={`Day ${card.due_day}`}
                                    dueDay={card.due_day}
                                />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
