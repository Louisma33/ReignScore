import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';

type Reward = {
    id: number;
    title: string;
    description: string;
    code: string;
    expiry_date: string;
    color: string;
};

export default function RewardsScreen() {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const cardColor = useThemeColor({}, 'card');
    const inputColor = useThemeColor({}, 'input');
    const textColor = useThemeColor({}, 'text');
    const cardTextColor = useThemeColor({}, 'cardText'); // For text on Gold surface
    const iconColor = useThemeColor({}, 'icon');

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            const data = await api.get('/rewards');
            setRewards(data);
        } catch (e) {
            console.error('Failed to load rewards', e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRewards();
        setRefreshing(false);
    };

    const copyToClipboard = async (code: string) => {
        await Clipboard.setStringAsync(code);
        if (Platform.OS === 'web') {
            window.alert(`Code ${code} copied to clipboard.`);
        } else {
            Alert.alert('Copied!', `Code ${code} copied to clipboard.`);
        }
    };

    const renderItem = ({ item }: { item: Reward }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => copyToClipboard(item.code)}
        >
            <ThemedView style={[styles.card, { borderLeftColor: item.color || Colors.light.tint, backgroundColor: cardColor }]}>
                <ThemedView style={styles.cardContent}>
                    <ThemedView style={styles.cardHeader}>
                        <ThemedView style={{ flex: 1 }}>
                            <ThemedText type="subtitle" style={[styles.cardTitle, { color: cardTextColor }]}>{item.title}</ThemedText>
                            <ThemedText style={[styles.expiry, { color: cardTextColor }]}>Valid until {new Date(item.expiry_date).toLocaleDateString()}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                            <IconSymbol name="gift.fill" size={28} color={item.color || Colors.light.tint} />
                        </ThemedView>
                    </ThemedView>

                    <ThemedText style={[styles.description, { color: cardTextColor }]}>{item.description}</ThemedText>

                    {item.code && (
                        <ThemedView style={[styles.codeContainer, { backgroundColor: inputColor }]}>
                            <ThemedText style={[styles.codeLabel, { color: textColor }]}>CODE:</ThemedText>
                            <ThemedText style={[styles.codeText, { color: item.color || Colors.light.tint }]}>{item.code}</ThemedText>
                            <IconSymbol name="doc.on.doc" size={16} color={iconColor} style={styles.copyIcon} />
                        </ThemedView>
                    )}
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.pageTitle}>Your Rewards</ThemedText>
                <ThemedText style={styles.pageSubtitle}>Exclusive offers and perks just for you.</ThemedText>
            </ThemedView>
            <FlatList
                contentContainerStyle={styles.list}
                data={rewards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />
                }
                ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>No rewards available at the moment. Check back soon!</ThemedText>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    pageSubtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 20,
    },
    card: {
        borderRadius: 20,
        borderLeftWidth: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        padding: 20,
        backgroundColor: 'transparent',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        fontSize: 15,
        marginBottom: 15,
        lineHeight: 22,
        opacity: 0.9,
    },
    expiry: {
        fontSize: 13,
        opacity: 0.5,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    codeLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
        letterSpacing: 1,
        opacity: 0.7,
    },
    codeText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 1,
    },
    copyIcon: {
        opacity: 0.7,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        opacity: 0.5,
    },
});
