import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Link } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { TransactionList } from '../../components/TransactionList';

export default function HomeScreen() {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const actionColor = useThemeColor({}, 'action');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          source={require('@/assets/images/card-reign-premium.png')}
          style={styles.headerImage}
          contentFit="contain"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Payments</ThemedText>
        <Link href="/pay" style={{ marginTop: 10 }}>
          <ThemedText type="link">Make a Payment</ThemedText>
        </Link>
        <Link href="/plastiq/pay-bill" style={{ marginTop: 10 }}>
          <ThemedText type="link">Pay a Bill (Plastiq)</ThemedText>
        </Link>
        <Link href="/add-card" style={{ marginTop: 10 }}>
          <ThemedText type="link">Add a New Card</ThemedText>
        </Link>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText type="subtitle">Savings Goals</ThemedText>
          <Link href="/vaults" asChild>
            <TouchableOpacity>
              <ThemedText type="link">View All</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
        <Link href="/vaults" asChild>
          <TouchableOpacity style={StyleSheet.flatten([styles.vaultCard, { backgroundColor: cardColor, borderColor }])}>
            <View style={[styles.vaultIcon, { backgroundColor: tintColor }]}>
              <IconSymbol name="star.fill" size={24} color={actionColor} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">My Vaults</ThemedText>
              <ThemedText style={{ color: '#888', fontSize: 12 }}>Tap to manage goals</ThemedText>
            </View>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      <TransactionList />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
  },
  vaultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
