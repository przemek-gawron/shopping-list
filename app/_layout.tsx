import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/context/app-context';
import { ShoppingListProvider } from '@/context/shopping-list-context';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppProvider>
        <ShoppingListProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="shopping-list" options={{ headerBackTitle: 'Kategorie' }} />
              <Stack.Screen name="recipe/import-photo" options={{ presentation: 'modal' }} />
              <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="category/manage" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ShoppingListProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
