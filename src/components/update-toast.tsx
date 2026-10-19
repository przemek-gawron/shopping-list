import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { tintFill } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';

/** Id of the last update the app ran, to tell a fresh over-the-air update apart. */
const LAST_UPDATE_KEY = 'shopping-list:last-update';
const INSTALLED_VISIBLE_MS = 5000;
/** Height of the bottom tab bar above the safe-area inset; the notice sits just over it. */
const TAB_BAR = Platform.OS === 'ios' ? 50 : 80;

type Toast = { kind: 'installed'; at: Date | null } | { kind: 'ready' };

/**
 * Over-the-air update notices (expo-updates is off in development and Expo Go):
 * "new version ready — restart" once an update has downloaded, and "updated" on the
 * first launch of a new update.
 */
export function UpdateToast() {
  const theme = useTheme();
  const t = useT();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { isUpdatePending } = Updates.useUpdates();
  const [installed, setInstalled] = useState<Toast | null>(null);
  const [readyDismissed, setReadyDismissed] = useState(false);
  // a downloaded update outranks the "updated" notice and stays until dismissed
  const toast: Toast | null = isUpdatePending && !readyDismissed ? { kind: 'ready' } : installed;
  const dismiss = () => (toast?.kind === 'ready' ? setReadyDismissed(true) : setInstalled(null));

  useEffect(() => {
    // Expo Go loads every dev reload as a new "update"
    if (!Updates.isEnabled || __DEV__) return;
    const current = Updates.isEmbeddedLaunch ? 'embedded' : (Updates.updateId ?? 'embedded');
    AsyncStorage.getItem(LAST_UPDATE_KEY)
      .then((last) => {
        if (current !== 'embedded' && last !== current) setInstalled({ kind: 'installed', at: Updates.createdAt });
        return AsyncStorage.setItem(LAST_UPDATE_KEY, current);
      })
      .catch(() => {});
  }, []);

  // the native side only checks at cold start; also look when the app returns to the foreground
  useEffect(() => {
    if (!Updates.isEnabled || __DEV__) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      Updates.checkForUpdateAsync()
        .then((result) => (result.isAvailable ? Updates.fetchUpdateAsync() : undefined))
        .catch(() => {});
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!installed) return;
    const timer = setTimeout(() => setInstalled(null), INSTALLED_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [installed]);

  if (!toast) return null;

  const when =
    toast.kind === 'installed' && toast.at
      ? toast.at.toLocaleString(locale, { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="box-none"
      // at the bottom it covers neither the screen title nor the back button
      style={[styles.wrap, { bottom: insets.bottom + TAB_BAR + 8 }]}>
      <Pressable
        onPress={dismiss}
        accessibilityRole="alert"
        style={[styles.toast, { backgroundColor: theme.toastBackground, borderColor: theme.border }]}>
        <View style={styles.flex}>
          <ThemedText type="small" color="text" style={styles.title}>
            {toast.kind === 'ready' ? t('update_ready') : t('update_installed')}
          </ThemedText>
          {when && <ThemedText type="caption">{t('update_version', { when })}</ThemedText>}
        </View>
        {toast.kind === 'ready' && (
          <Pressable
            onPress={() => Updates.reloadAsync().catch(() => {})}
            hitSlop={8}
            accessibilityRole="button"
            style={[styles.action, tintFill(theme)]}>
            <ThemedText type="small" color="onPrimary" style={styles.title}>
              {t('update_restart')}
            </ThemedText>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontWeight: '700' },
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  action: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
