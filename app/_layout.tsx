
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';

// Protected Layout Component
function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth group
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      // Redirect to tabs if authenticated and trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="pay" options={{ title: 'Make Payment', presentation: 'modal' }} />
        <Stack.Screen name="add-card" options={{ title: 'Add Card', presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <ProtectedLayout />
      </AuthProvider>
    </CustomThemeProvider>
  );
}
