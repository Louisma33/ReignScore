import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PayBillScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { token } = useAuth();

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/cards`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCards(data);
                if (data.length > 0) {
                    setSelectedCardId(data[0].id.toString());
                }
            }
        } catch (error) {
            console.error('Failed to fetch cards:', error);
            Alert.alert('Error', 'Failed to load your cards');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!amount || !recipientName || !selectedCardId) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setProcessing(true);
            const response = await fetch(`${API_URL}/plastiq/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    recipientName,
                    amount: parseFloat(amount),
                    cardId: selectedCardId
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Bill payment initiated successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Payment Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Error', 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const selectedCard = cards.find(c => c.id.toString() === selectedCardId);

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color="#FFF" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.headerTitle}>Pay Bill</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Recipient Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>To</ThemedText>
                    <View style={styles.inputContainer}>
                        <IconSymbol name="person.fill" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
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
                                        selectedCardId === card.id.toString() && styles.selectedCardOption
                                    ]}
                                    onPress={() => setSelectedCardId(card.id.toString())}
                                >
                                    <View style={[styles.cardIcon, { backgroundColor: selectedCardId === card.id.toString() ? '#FFD700' : '#333' }]}>
                                        <IconSymbol name="creditcard.fill" size={20} color={selectedCardId === card.id.toString() ? '#000' : '#FFF'} />
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
                <View style={styles.summaryContainer}>
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

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[styles.payButton, processing && styles.payButtonDisabled]}
                    onPress={handlePay}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <ThemedText style={styles.payButtonText}>Pay Bill</ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#000',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        marginTop: 10,
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56
    },
    inputIcon: {
        marginRight: 12
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    currencySymbol: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFD700',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFF',
        minWidth: 100,
    },
    cardList: {
        flexDirection: 'row',
    },
    cardOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#333',
        width: 160
    },
    selectedCardOption: {
        borderColor: '#FFD700',
        backgroundColor: '#2A2A2A'
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    cardName: {
        fontSize: 14,
        fontWeight: '600'
    },
    cardLast4: {
        fontSize: 12,
        color: '#888'
    },
    summaryContainer: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 16,
        gap: 12
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryLabel: {
        color: '#888',
        fontSize: 14
    },
    summaryValue: {
        fontSize: 14,
        fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' })
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 12,
        marginTop: 4
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700'
    },
    poweredBy: {
        fontSize: 10,
        color: '#444',
        textAlign: 'center',
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderTopWidth: 1,
        borderTopColor: '#1E1E1E',
    },
    payButton: {
        backgroundColor: '#FFD700',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    payButtonDisabled: {
        opacity: 0.7
    },
    payButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
