import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UpdateToast } from '@/components/update-toast';
import { Colors } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useT } from '@/i18n';

/** Keys written by the pre-rewrite version of the app; the new version starts from scratch. */
const LEGACY_KEYS = [
  'shopping-list:products',
  'shopping-list:recipes',
  'shopping-list:selections',
  'shopping-list:categories',
];

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const t = useT();
  // the persisted store loads asynchronously; wait for it so screens never flash empty data
  const hydrated = useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
  );

  useEffect(() => {
    void AsyncStorage.multiRemove(LEGACY_KEYS).catch(() => {});
  }, []);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.tint,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.tint,
      },
    };
  }, [scheme, colors]);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  // iOS modals have no back arrow; without this the only way out is the swipe-down gesture
  const modal = {
    presentation: 'modal',
    headerLeft:
      Platform.OS === 'ios'
        ? () => (
            <Text
              onPress={() => router.back()}
              accessibilityRole="button"
              style={{ color: colors.tint, fontSize: 16, fontWeight: '600', paddingHorizontal: 6 }}>
              {t('cancel')}
            </Text>
          )
        : undefined,
  } as const;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            headerTintColor: colors.tint,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
            headerBackTitle: t('back'),
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recipe/[id]" options={{ title: '' }} />
          <Stack.Screen name="recipe/form" options={modal} />
          <Stack.Screen name="groups" options={{ title: t('groups_title') }} />
          <Stack.Screen name="group/form" options={modal} />
          <Stack.Screen name="products" options={{ title: t('products_title') }} />
          <Stack.Screen name="product/form" options={modal} />
          <Stack.Screen name="plan/add" options={modal} />
          <Stack.Screen name="list/add" options={modal} />
          <Stack.Screen name="meals" options={{ title: t('meals_title') }} />
          <Stack.Screen name="menus" options={{ title: t('menus_title') }} />
          <Stack.Screen name="about" options={{ title: t('about_title') }} />
          <Stack.Screen name="substitutes" options={{ title: t('substitutes_title') }} />
        </Stack>
        {/* expo-updates has nothing to report on web */}
        {Platform.OS !== 'web' && <UpdateToast />}
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
