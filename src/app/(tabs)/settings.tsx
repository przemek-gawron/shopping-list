import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { parseMealPlanDoc, parseRecipeFile } from '@/data/import';
import { MAX_MEALS, useStore } from '@/data/store';
import type { Language } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { resolveLocale, useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function SettingsScreen() {
  const t = useT();
  const theme = useTheme();
  const mealCount = useStore((s) => s.mealCount);
  const language = useStore((s) => s.language);
  const setMealCount = useStore((s) => s.setMealCount);
  const setLanguage = useStore((s) => s.setLanguage);
  const loadSamples = useStore((s) => s.loadSamples);
  const clearAll = useStore((s) => s.clearAll);
  const importRecipes = useStore((s) => s.importRecipes);
  const groupByMenu = useStore((s) => s.groupByMenu);
  const setGroupByMenu = useStore((s) => s.setGroupByMenu);

  const link = (label: string, onPress: () => void, destructive = false) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}>
      <ThemedText style={styles.linkLabel} color={destructive ? 'destructive' : 'text'}>
        {label}
      </ThemedText>
      {!destructive && <IconSymbol name="chevron.right" size={16} color={theme.icon} />}
    </Pressable>
  );

  const onLoadSamples = () => {
    const added = loadSamples(resolveLocale(language));
    Alert.alert(added > 0 ? t('samples_loaded', { count: added }) : t('samples_already'));
  };

  const onImport = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/msword', 'application/json', 'text/plain'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets[0]) return;
    let file = null;
    let unknown = 0;
    try {
      const source = new File(picked.assets[0].uri);
      // a Word meal plan is parsed on the device; anything else must be a recipe JSON file
      const doc = parseMealPlanDoc(new Uint8Array(await source.arrayBuffer()), picked.assets[0].name);
      file = doc ? doc.file : parseRecipeFile(await source.text());
      unknown = doc?.unknown ?? 0;
    } catch {
      // unreadable file: reported below
    }
    if (!file || file.recipes.length === 0) return Alert.alert(t('import_invalid'));
    const { added, updated } = importRecipes(file);
    Alert.alert(t('import_done', { added, updated }), unknown > 0 ? t('import_unknown', { count: unknown }) : undefined);
  };

  return (
    <Screen title={t('settings_title')}>
      <ThemedText type="label">{t('settings_meals')}</ThemedText>
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <ThemedText style={styles.linkLabel}>{t('meals_per_day')}</ThemedText>
          <Stepper value={mealCount} onChange={setMealCount} min={1} max={MAX_MEALS} />
        </View>
        {link(t('meals_names'), () => router.push('/meals'))}
      </Card>

      <ThemedText type="label">{t('settings_recipes')}</ThemedText>
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <ThemedText style={[styles.linkLabel, styles.flex]}>{t('settings_group_by_menu')}</ThemedText>
          <Switch
            value={groupByMenu}
            onValueChange={setGroupByMenu}
            trackColor={{ true: theme.tint }}
            accessibilityLabel={t('settings_group_by_menu')}
          />
        </View>
        {link(t('settings_menus'), () => router.push('/menus'))}
      </Card>

      <ThemedText type="label">{t('settings_data')}</ThemedText>
      <Card style={styles.card}>
        {link(t('settings_groups'), () => router.push('/groups'))}
        {link(t('settings_products'), () => router.push('/products'))}
        {link(t('settings_import'), () => void onImport())}
        {link(t('settings_load_samples'), () =>
          confirm(t('settings_load_samples'), t('settings_load_samples_message'), t('add'), t('cancel'), onLoadSamples),
        )}
        {link(
          t('settings_clear_all'),
          () =>
            confirm(t('settings_clear_all'), t('settings_clear_all_message'), t('settings_clear_all_confirm'), t('cancel'), () => {
              clearAll();
              Alert.alert(t('settings_cleared'));
            }),
          true,
        )}
      </Card>

      <ThemedText type="label">{t('settings_language')}</ThemedText>
      <Segmented<Language>
        value={language}
        onChange={setLanguage}
        options={[
          { value: 'system', label: t('language_system') },
          { value: 'pl', label: 'Polski' },
          { value: 'en', label: 'English' },
        ]}
      />

      <ThemedText type="label">{t('settings_about')}</ThemedText>
      <Card style={styles.card}>{link(t('about_title'), () => router.push('/about'))}</Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, paddingVertical: 4 },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  linkLabel: { fontWeight: '600' },
  flex: { flex: 1 },
});
