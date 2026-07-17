import { Stack } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { t } from '@/i18n';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.headerChrome },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: t('auth_login_title') }} />
      <Stack.Screen name="register" options={{ title: t('auth_register_title') }} />
    </Stack>
  );
}
