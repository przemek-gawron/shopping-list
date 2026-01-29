import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/context/app-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recipe/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recipe/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="shopping-list" options={{}} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
