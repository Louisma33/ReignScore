import { usePushNotifications } from '@/hooks/usePushNotifications';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider, ThemeContext, useTheme } from '../context/ThemeContext';
import '../polyfill';

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'https://placeholder@sentry.io/123456',
  debug: __DEV__, // Only debug in development
});

// Protected Layout Component
function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useTheme(); // Use theme from context

  // DEBUG: Bypassed onboarding check (Reverting to true)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Initialize Push Notifications
  usePushNotifications();

  useEffect(() => {
    console.log('App: ProtectedLayout mounted');
  }, []);

  useEffect(() => {
    checkOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const checkOnboarding = async () => {
    console.log('App: checkOnboarding started');
    try {
      // Use timeout for SecureStore here too
      // const hasSeen = await SecureStore.getItemAsync(ONBOARDING_KEY);
      // DEBUG: Force Onboarding Seen to prevent loop
      const hasSeen = 'true';
      console.log('App: hasSeenOnboarding:', hasSeen);

      if (!hasSeen) {
        // @ts-ignore: Dynamic route
        console.log('App: Redirecting to onboarding');
        router.replace('/onboarding');
      } else {
        // Proceed with auth check
        console.log('App: Onboarding seen, checking auth');
        checkAuth();
      }
    } catch (error) {
      console.error('App: checkOnboarding error', error);
      checkAuth();
    } finally {
      console.log('App: checkOnboarding finished');
      setIsCheckingOnboarding(false);
    }
  };

  const checkAuth = () => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    // @ts-ignore: Dynamic route
    const isOnboarding = segments[0] === 'onboarding';

    if (isOnboarding) return; // Allow onboarding access

    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth group
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      // Redirect to tabs if authenticated and trying to access auth screens
      router.replace('/(tabs)');
    }
  };

  // console.log('App: Render check - isLoading:', isLoading, 'isCheckingOnboarding:', isCheckingOnboarding);

  if (isLoading || isCheckingOnboarding) {
    return (
      <CustomThemeProvider>
        <ThemeContext.Consumer>
          {({ theme }) => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme === 'dark' ? '#000' : '#fff',
              }}
            >
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          )}
        </ThemeContext.Consumer>
      </CustomThemeProvider>
    );
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="pay" options={{ title: 'Make Payment', presentation: 'modal' }} />
        <Stack.Screen name="add-card" options={{ title: 'Add Card', presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PostHogProvider apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_PLACEHOLDER'} options={{ host: 'https://us.i.posthog.com' }}>
      <CustomThemeProvider>
        <AuthProvider>
          <ProtectedLayout />
        </AuthProvider>
      </CustomThemeProvider>
    </PostHogProvider>
  );
}
