import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import { useState, useCallback } from "react";

export default function Notifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            // Trigger check first to ensure fresh data
            await api.notifications.check();
            const data = await api.notifications.list();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.notifications.read(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="px-6 py-4 border-b border-gray-800 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#D4AF37" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-cr-text">Notifications</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {notifications.length === 0 ? (
                    <View className="p-8 items-center">
                        <Text className="text-cr-muted text-center">No notifications yet.</Text>
                    </View>
                ) : (
                    notifications.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => markAsRead(item.id)}
                            className={`px-6 py-4 border-b border-gray-800 ${item.is_read ? 'bg-cr-black' : 'bg-cr-card'}`}
                        >
                            <View className="flex-row">
                                <View className={`w-2 h-2 rounded-full mt-2 mr-3 ${item.is_read ? 'bg-transparent' : 'bg-cr-gold'}`} />
                                <View className="flex-1">
                                    <Text className={`text-base mb-1 ${item.is_read ? 'text-cr-muted' : 'text-cr-text font-bold'}`}>
                                        {item.title}
                                    </Text>
                                    <Text className="text-gray-400 leading-relaxed">
                                        {item.message}
                                    </Text>
                                    <Text className="text-gray-500 text-xs mt-2">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
