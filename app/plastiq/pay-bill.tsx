import { CrownAnimation } from '@/components/CrownAnimation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/services/api';
export default function PayBillScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // const { token } = useAuth(); // Removed unused

    // Theme Colors
    const backgroundColor = useThemeColor({}, 'background');
    // const cardColor = useThemeColor({}, 'card'); // Removed unused
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'tabIconDefault');
    const primaryColor = useThemeColor({}, 'tint');
    const inputBg = useThemeColor({}, 'input');
    const borderColor = useThemeColor({}, 'border');

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showCrown, setShowCrown] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await api.get('/cards');
            setCards(data);
            if (data.length > 0) {
                setSelectedCardId(data[0].id.toString());
            }
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            if (Platform.OS === 'web') {
                window.alert('Failed to load your cards');
            } else {
                Alert.alert('Error', 'Failed to load your cards');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!amount || !recipientName || !selectedCardId) {
            if (Platform.OS === 'web') {
                window.alert('Please fill in all fields');
            } else {
                Alert.alert('Error', 'Please fill in all fields');
            }
            return;
        }

        try {
            setProcessing(true);
            await api.post('/plastiq/pay', {
                recipientName,
                amount: parseFloat(amount),
                cardId: selectedCardId
            });

            if (Platform.OS === 'web') {
                setShowCrown(true);
                window.alert('Bill payment initiated successfully!');
                router.back();
            } else {
                setShowCrown(true);
                // Delay alert slightly to let animation start/haptics fire? 
                // Or just show alert. The Alert might block the view of the animation.
                // Let's show animation, wait a sec, then alert.
                setTimeout(() => {
                    Alert.alert('Success', 'Bill payment initiated successfully!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }, 1000);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            if (Platform.OS === 'web') {
                window.alert(error.message || 'Failed to process payment');
            } else {
                Alert.alert('Payment Failed', error.message || 'Failed to process payment');
            }
        } finally {
            setProcessing(false);
        }
    };

    // const selectedCard = cards.find(c => c.id.toString() === selectedCardId);

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: inputBg }]}>
                    <IconSymbol name="chevron.left" size={24} color={textColor} />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.headerTitle}>Pay Bill</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Recipient Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>To</ThemedText>
                    <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                        <IconSymbol name="person.fill" size={20} color={placeholderColor} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: textColor }]}
                            placeholder="Recipient Name (e.g. Electric Co)"
                            placeholderTextColor="#666"
                            value={recipientName}
                            onChangeText={setRecipientName}
                        />
                    </View>
                </View>

                {/* Amount Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Amount</ThemedText>
                    <View style={styles.amountContainer}>
                        <ThemedText style={styles.currencySymbol}>$</ThemedText>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            placeholderTextColor="#333"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </View>

                {/* Card Selection */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Pay From</ThemedText>
                    {loading ? (
                        <ActivityIndicator color="#FFD700" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardList}>
                            {cards.map((card) => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[
                                        styles.cardOption,
                                        { backgroundColor: inputBg, borderColor: borderColor },
                                        selectedCardId === card.id.toString() && { borderColor: primaryColor, backgroundColor: inputBg }
                                    ]}
                                    onPress={() => setSelectedCardId(card.id.toString())}
                                >
                                    <View style={[styles.cardIcon, { backgroundColor: selectedCardId === card.id.toString() ? primaryColor : borderColor }]}>
                                        <IconSymbol name="creditcard.fill" size={20} color={selectedCardId === card.id.toString() ? '#FFF' : textColor} />
                                    </View>
                                    <View>
                                        <ThemedText style={styles.cardName}>{card.issuer}</ThemedText>
                                        <ThemedText style={styles.cardLast4}>•••• {card.ending_digits}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: inputBg }]}>
                    <View style={styles.summaryRow}>
                        <ThemedText style={styles.summaryLabel}>Bill Amount</ThemedText>
                        <ThemedText style={styles.summaryValue}>${amount || '0.00'}</ThemedText>
                    </View>
                    <View style={styles.summaryRow}>
                        <ThemedText style={styles.summaryLabel}>Fee (2.9%)</ThemedText>
                        <ThemedText style={styles.summaryValue}>${(parseFloat(amount || '0') * 0.029).toFixed(2)}</ThemedText>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <ThemedText style={styles.totalLabel}>Total</ThemedText>
                        <ThemedText style={styles.totalValue}>
                            ${(parseFloat(amount || '0') * 1.029).toFixed(2)}
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.poweredBy}>Powered by Plastiq</ThemedText>
                </View>

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: borderColor, backgroundColor }]}>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: primaryColor }, processing && styles.payButtonDisabled]}
                    onPress={handlePay}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <ThemedText style={[styles.payButtonText, { color: '#FFF' }]}>Pay Bill</ThemedText>
                    )}
                </TouchableOpacity>
            </View>
            <CrownAnimation trigger={showCrown} />
        </ThemedView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        zIndex: 10
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 100
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.8
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50
    },
    inputIcon: {
        marginRight: 10
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    currencySymbol: {
        fontSize: 40,
        fontWeight: 'bold',
        opacity: 0.6
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
        minWidth: 100,
        textAlign: 'center'
    },
    cardList: {
        flexDirection: 'row',
    },
    cardOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 10,
        minWidth: 160
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    cardName: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    cardLast4: {
        fontSize: 12,
        opacity: 0.7
    },
    summaryContainer: {
        borderRadius: 16,
        padding: 20,
        marginTop: 10
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    summaryLabel: {
        fontSize: 14,
        opacity: 0.7
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600'
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 5
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF'
    },
    poweredBy: {
        textAlign: 'center',
        fontSize: 10,
        color: '#aaa',
        marginTop: 15
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1
    },
    payButton: {
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    payButtonDisabled: {
        opacity: 0.5
    },
    payButtonText: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});


