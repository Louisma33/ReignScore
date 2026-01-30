

import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { IconSymbol } from '../components/ui/icon-symbol';
import { Colors } from '../constants/theme';
import { api } from '../services/api';

type Challenge = {
    id: number;
    title: string;
    description: string;
    points: number;
    icon: string;
    status: 'in_progress' | 'completed' | null;
    progress: number;
};

export default function ChallengesScreen() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    const loadChallenges = async () => {
        try {
            setLoading(true);
            const data = await api.getChallenges();
            setChallenges(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadChallenges();
        }, [])
    );

    const handleJoin = async (id: number) => {
        // Implement join logic here - currently just a visual placeholder
        // In real app, call api.post(`/challenges/${id}/join`)
        // and then reload list
        console.log('Join challenge', id);
        // Optimistic update for demo
        setChallenges(prev => prev.map(c => c.id === id ? { ...c, status: 'in_progress', progress: 0 } : c));
    };

    const renderItem = ({ item }: { item: Challenge }) => {
        const isJoined = item.status === 'in_progress' || item.status === 'completed';
        const isCompleted = item.status === 'completed';

        return (
            <View style={styles.card}>
                <View style={[styles.iconContainer, isCompleted && styles.completedIcon]}>
                    <IconSymbol
                        name={item.icon as any || 'star.fill'}
                        size={24}
                        color={isCompleted ? '#000' : Colors.common.gold}
                    />
                </View>
                <View style={styles.cardContent}>
                    <ThemedText style={styles.title}>{item.title}</ThemedText>
                    <ThemedText style={styles.desc}>{item.description}</ThemedText>
                    <ThemedText style={styles.points}>+{item.points} Points</ThemedText>
                </View>
                {/* Status / Action */}
                <View style={styles.actionArea}>
                    {isJoined ? (
                        <View style={styles.statusBadge}>
                            <ThemedText style={styles.statusText}>
                                {isCompleted ? 'Done' : 'Active'}
                            </ThemedText>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.joinButton} onPress={() => handleJoin(item.id)}>
                            <ThemedText style={styles.joinText}>Join</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Crown Challenges', headerTintColor: Colors.common.gold }} />

            {loading && challenges.length === 0 ? (
                <View style={styles.center}><ActivityIndicator color={Colors.common.gold} /></View>
            ) : (
                <FlatList
                    data={challenges}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <ThemedText style={styles.headerText}>
                                Complete challenges to earn points and unlock exclusive rewards.
                            </ThemedText>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <ThemedText style={{ color: '#888' }}>No challenges available right now.</ThemedText>
                        </View>
                    }
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    list: { padding: 20 },
    header: { marginBottom: 20 },
    headerText: { color: '#CCC', textAlign: 'center', fontSize: 16 },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333'
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)'
    },
    completedIcon: {
        backgroundColor: Colors.common.gold,
    },
    cardContent: { flex: 1, marginRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
    desc: { fontSize: 13, color: '#AAA', marginBottom: 6 },
    points: { fontSize: 12, fontWeight: 'bold', color: Colors.common.gold },
    actionArea: { justifyContent: 'center' },
    joinButton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    joinText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12
    },
    statusText: { color: '#AAA', fontSize: 11, fontWeight: '600' }
});
