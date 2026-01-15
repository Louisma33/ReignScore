import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    const colorScheme = useColorScheme();

    const cardColor = useThemeColor({}, 'card');
    const inputColor = useThemeColor({}, 'input');
    const textColor = useThemeColor({}, 'text');
    const tintColor = useThemeColor({}, 'tint');

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

    const copyToClipboard = async (code: string) => {
        await Clipboard.setStringAsync(code);
        Alert.alert('Copied!', `Code ${code} copied to clipboard.`);
    };

    const renderItem = ({ item }: { item: Reward }) => (
        <ThemedView style={[styles.card, { borderLeftColor: item.color, backgroundColor: cardColor }]}>
            <ThemedView style={styles.cardHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{item.title}</ThemedText>
                <IconSymbol name="gift.fill" size={24} color={item.color} />
            </ThemedView>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
            <ThemedView style={styles.footer}>
                <ThemedText style={styles.expiry}>Exp: {new Date(item.expiry_date).toLocaleDateString()}</ThemedText>
                {item.code && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: inputColor }]}
                        onPress={() => copyToClipboard(item.code)}
                    >
                        <ThemedText style={[styles.buttonText, { color: textColor }]}>{item.code}</ThemedText>
                    </TouchableOpacity>
                )}
            </ThemedView>
        </ThemedView>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Example Rewards</ThemedText>
            </ThemedView>
            <FlatList
                data={rewards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    list: {
        paddingHorizontal: 20,
        gap: 20,
        paddingBottom: 20,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 6,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: 18,
    },
    description: {
        marginBottom: 15,
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    expiry: {
        fontSize: 12,
        opacity: 0.5,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontWeight: 'bold',
        fontFamily: 'Courier', // Monospace for code
    },
});
