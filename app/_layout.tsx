import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';

import { AuthNavigationGuard } from '@/components/auth/auth-navigation-guard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/i18n';
import { AppProvider } from '@/context/app-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ShoppingListProvider } from '@/context/shopping-list-context';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutInner fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutInner({ fontsLoaded }: { fontsLoaded: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { isLoading: authLoading } = useAuth();

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.tint,
        background: colors.background,
        card: colors.cardBackground,
        text: colors.text,
        border: colors.border,
        notification: colors.tint,
      },
    }),
    [isDark, colors]
  );

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  if (!fontsLoaded || authLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppProvider>
        <ShoppingListProvider>
          <ThemeProvider value={navigationTheme}>
            <AuthNavigationGuard>
              <Stack
                screenOptions={{
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="product/new" options={{ presentation: 'modal' }} />
                <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
                <Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="shopping-list" options={{ headerBackTitle: t('back_to_categories') }} />
                <Stack.Screen name="recipe/import-photo" options={{ presentation: 'modal' }} />
                <Stack.Screen
                  name="recipe/import-meal-plan"
                  options={{ headerBackTitle: t('back_to_categories') }}
                />
                <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="category/manage" />
              </Stack>
            </AuthNavigationGuard>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ShoppingListProvider>
      </AppProvider>
    </View>
  );
}
