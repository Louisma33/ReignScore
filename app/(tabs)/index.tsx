import { CrownAnimation } from '@/components/CrownAnimation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeLink } from '@/components/ui/SafeLink';
import { getRandomSlogan } from '@/constants/slogans';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Card {
  id: number;
  issuer: string;
  ending_digits: string;
  balance: string; // numeric string from DB
  limit_amount: string;
  due_day: number;
  color_theme: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cardColor = useThemeColor({}, 'card');
  const cardTextColor = useThemeColor({}, 'cardText');

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slogan, setSlogan] = useState(getRandomSlogan());
  const [showCrown, setShowCrown] = useState(false);

  const fetchCards = async (isRefresh = false) => {
    try {
      const data = await api.get('/cards');
      if (Array.isArray(data)) {
        setCards(data);
        // Trigger crown animation on successful refresh
        if (isRefresh) {
          setShowCrown(true);
          setSlogan(getRandomSlogan());
        }
      }
    } catch (e) {
      console.error('Failed to fetch cards', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCards(false);
    }, [])
  );



  const onRefresh = () => {
    setRefreshing(true);
    fetchCards(true);
  };


  // Calculations
  const totalBalance = cards.reduce((sum, c) => sum + parseFloat(c.balance), 0);
  const totalLimit = cards.reduce((sum, c) => sum + parseFloat(c.limit_amount), 0);
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    if (dueDay >= currentDay) {
      return dueDay - currentDay;
    } else {
      // Due next month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return (daysInMonth - currentDay) + dueDay;
    }
  };

  // Smart Reminder: Utilization Alert
  React.useEffect(() => {
    const checkUtilization = async () => {
      // Logic requires utilization to be calculated
      if (!loading && utilization > 30) {
        try {
          const lastWarnStr = await SecureStore.getItemAsync('last_util_warning');
          const lastWarn = lastWarnStr ? parseInt(lastWarnStr) : 0;
          const now = Date.now();
          // Warn once every 72 hours
          if (now - lastWarn > 3600000 * 72) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Credit Alert ⚠️",
                body: `Your utilization is ${utilization.toFixed(1)}%. Pay it down to <10% to maximize your score growth!`,
              },
              trigger: null,
            });
            await SecureStore.setItemAsync('last_util_warning', now.toString());
          }
        } catch (e) {
          console.log('Notification Check Failed', e);
        }
      }
    };
    checkUtilization();
  }, [utilization, loading]);

  return (
    <ThemedView style={styles.container}>
      <CrownAnimation
        trigger={showCrown}
        onComplete={() => setShowCrown(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Monitoring Dashboard</ThemedText>
          <ThemedText type="title">{user?.name || 'My Finance'}</ThemedText>
          <ThemedText style={{ fontSize: 12, color: Colors.common.gold, marginTop: 4, fontStyle: 'italic' }}>
            &quot;{slogan}&quot;
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/settings')}>
          <IconSymbol name="person.circle.fill" size={40} color={Colors.common.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.common.gold} />}
      >
        {/* Balance & Utilization Card */}
        <LinearGradient
          colors={['#FFD700', '#FDB931']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View>
            <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
            <ThemedText style={styles.balanceAmount}>${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</ThemedText>
          </View>

          <View style={styles.utilizationRow}>
            <View>
              <ThemedText style={styles.utilizationLabel}>Credit Utilization</ThemedText>
              <ThemedText style={styles.utilizationValue}>{utilization.toFixed(1)}%</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.utilizationLabel}>Total Limit</ThemedText>
              <ThemedText style={styles.utilizationValue}>${totalLimit.toLocaleString()}</ThemedText>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(utilization, 100)}%` }]} />
            {/* Quick Actions */}
          </View>
          <View style={styles.quickActions}>
            <SafeLink href="/add-card" asChild>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardColor, flex: 1, marginRight: 8 }]}>
                <IconSymbol name="plus.circle.fill" size={24} color={cardTextColor} />
                <ThemedText style={[styles.actionText, { color: cardTextColor, fontSize: 14 }]}>Add</ThemedText>
              </TouchableOpacity>
            </SafeLink>
            <SafeLink href="/pay" asChild>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: cardColor, flex: 1, marginRight: 8 }]}>
                <IconSymbol name="arrow.up.right.circle.fill" size={24} color={cardTextColor} />
                <ThemedText style={[styles.actionText, { color: cardTextColor, fontSize: 14 }]}>Pay</ThemedText>
              </TouchableOpacity>
            </SafeLink>
            <TouchableOpacity
              onPress={() => router.push('/advisor')}
              style={[styles.actionButton, { backgroundColor: '#1e293b', flex: 1, borderWidth: 1, borderColor: Colors.common.gold }]}
            >
              <IconSymbol name="sparkles" size={24} color={Colors.common.gold} />
              <ThemedText style={[styles.actionText, { color: Colors.common.gold, fontSize: 14 }]}>Ask AI</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>


        {/* Card Monitoring List */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Monitored Cards</ThemedText>
        </View>

        {loading && cards.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.common.gold} />
        ) : cards.length === 0 ? (
          <ThemedText style={{ textAlign: 'center', opacity: 0.6 }}>No cards added yet.</ThemedText>
        ) : (
          cards.map(card => {
            const cardBal = parseFloat(card.balance);
            const cardLim = parseFloat(card.limit_amount);
            const cardUtil = cardLim > 0 ? (cardBal / cardLim) * 100 : 0;
            const daysDue = getDaysUntilDue(card.due_day);

            return (
              <View key={card.id} style={[styles.cardItem, { backgroundColor: cardColor }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <IconSymbol name="creditcard.fill" size={20} color={Colors.common.gold} />
                    <ThemedText type="defaultSemiBold" style={{ color: cardTextColor }}>{card.issuer}</ThemedText>
                  </View>
                  <ThemedText style={{ color: cardTextColor, opacity: 0.7 }}>••• {card.ending_digits}</ThemedText>
                </View>

                <View style={styles.cardBody}>
                  <View>
                    <ThemedText style={[styles.label, { color: cardTextColor }]}>Balance</ThemedText>
                    <ThemedText style={[styles.value, { color: cardTextColor }]}>${cardBal.toLocaleString()}</ThemedText>
                  </View>
                  <View>
                    <ThemedText style={[styles.label, { color: cardTextColor, textAlign: 'right' }]}>Due in</ThemedText>
                    <ThemedText style={[styles.value, { color: daysDue <= 3 ? '#FF3B30' : Colors.common.gold, textAlign: 'right' }]}>
                      {daysDue} days
                    </ThemedText>
                  </View>
                </View>

                {/* Card Utilization Bar */}
                <View style={styles.miniProgressBg}>
                  <View style={[
                    styles.miniProgressFill,
                    {
                      width: `${Math.min(cardUtil, 100)}%`,
                      backgroundColor: cardUtil > 80 ? '#FF3B30' : Colors.common.gold
                    }
                  ]} />
                </View>
              </View>
            );
          })
        )}

      </ScrollView>
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  utilizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  utilizationLabel: {
    color: '#000',
    fontSize: 12,
    opacity: 0.7,
  },
  utilizationValue: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  cardItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'left'
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  }
});
