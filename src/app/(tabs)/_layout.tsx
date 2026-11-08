import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useT } from '@/i18n';

// Tab bar minimizing exists only on iOS 26+; older iOS warns about the prop.
const canMinimize = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;

export default function TabLayout() {
  const colors = Colors[useColorScheme()];
  const t = useT();

  return (
    <NativeTabs
      tintColor={colors.tint}
      backgroundColor={colors.background}
      indicatorColor={colors.surfaceCard}
      labelVisibilityMode="labeled"
      minimizeBehavior={canMinimize ? 'never' : undefined}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tab_recipes')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>{t('tab_plan')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Label>{t('tab_list')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('tab_settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
