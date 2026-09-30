import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n';

export default function AboutScreen() {
  const t = useT();
  const points = ['about_recipes', 'about_plan', 'about_list', 'about_photos', 'about_offline'];

  return (
    <Page>
      <View style={styles.hero}>
        <ThemedText style={styles.emoji}>🛒</ThemedText>
        <ThemedText type="title">{t('app_name')}</ThemedText>
        <ThemedText type="small">{t('about_version', { version: Constants.expoConfig?.version ?? '1.0.0' })}</ThemedText>
      </View>
      <ThemedText>{t('about_intro')}</ThemedText>
      {points.map((key) => (
        <View key={key} style={styles.point}>
          <ThemedText type="heading">{t(`${key}_title`)}</ThemedText>
          <ThemedText type="small">{t(`${key}_text`)}</ThemedText>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.three },
  emoji: { fontSize: 56, lineHeight: 68 },
  point: { gap: Spacing.one },
});
