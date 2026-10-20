import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Page } from '@/components/screen';
import { useFormatServings } from '@/components/servings';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { decodePlanLink } from '@/data/plan-link';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { formatDate } from '@/utils/dates';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Preview of a plan opened from a link; importing replaces the plan of its days. */
export default function ImportPlanScreen() {
  const { d } = useLocalSearchParams<{ d?: string }>();
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const slotName = useSlotName();
  const formatServings = useFormatServings();
  const recipes = useStore((s) => s.recipes);
  const importPlan = useStore((s) => s.importPlan);

  const payload = useMemo(() => (d ? decodePlanLink(d) : null), [d]);

  if (!payload) {
    return (
      <Page>
        <Stack.Screen options={{ title: t('import_plan_title') }} />
        <ThemedText>{t('import_plan_invalid')}</ThemedText>
      </Page>
    );
  }

  const short = (date: string) => formatDate(date, locale, { day: 'numeric', month: 'short' });
  const range = payload.start === payload.end ? short(payload.start) : `${short(payload.start)} – ${short(payload.end)}`;
  const known = (title: string) => recipes.some((r) => r.title.toLowerCase() === title.toLowerCase());
  const newRecipes = new Set(
    payload.entries.flatMap((e) => (e.recipe === undefined ? [] : [payload.recipes.recipes[e.recipe].title])).filter((title) => !known(title)),
  ).size;
  const dates = [...new Set(payload.entries.map((e) => e.date))];

  const confirm = () => {
    importPlan(payload);
    router.dismissTo({ pathname: '/plan', params: { date: payload.start } });
  };

  return (
    <Page>
      <Stack.Screen options={{ title: t('import_plan_title') }} />
      <ThemedText type="heading">{range}</ThemedText>
      <ThemedText type="small">
        {t('import_plan_replace')}
        {newRecipes > 0 && ` ${t('import_plan_new_recipes', { count: newRecipes })}`}
      </ThemedText>
      <Button label={t('import_plan_confirm')} onPress={confirm} />

      {dates.map((date) => (
        <Card key={date} style={styles.day}>
          <ThemedText style={[styles.dayLabel, { color: theme.tint }]}>
            {capitalize(formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' }))}
          </ThemedText>
          {payload.entries
            .filter((e) => e.date === date)
            .sort((a, b) => a.slot - b.slot)
            .map((e, i, meals) => (
              <View key={i}>
                {/* further dishes of the same meal go under its name */}
                {e.slot !== meals[i - 1]?.slot && (
                  <ThemedText type="label" style={styles.slot}>
                    {slotName({ id: '', ...payload.slots[e.slot] }, e.slot)}
                  </ThemedText>
                )}
                <ThemedText>
                  {e.recipe === undefined ? (e.ordered ? `🛵 ${e.note}` : e.note) : payload.recipes.recipes[e.recipe].title}
                  {e.recipe !== undefined && e.servings !== 1 && (
                    <ThemedText style={{ color: theme.tint }}> {formatServings(e.servings)}</ThemedText>
                  )}
                </ThemedText>
              </View>
            ))}
        </Card>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  day: { gap: Spacing.one },
  dayLabel: { fontWeight: '700' },
  slot: { marginTop: 4 },
});
