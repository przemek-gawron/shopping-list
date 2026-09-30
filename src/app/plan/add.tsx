import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Page } from '@/components/screen';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { addDays, formatDate, today } from '@/utils/dates';

/** Adds a recipe to a day + meal slot. Opened from the plan (date/slot known) or from a recipe (recipe known). */
export default function PlanAddScreen() {
  const params = useLocalSearchParams<{ date?: string; slotId?: string; recipeId?: string }>();
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const slotName = useSlotName();
  const recipes = useStore((s) => s.recipes);
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const setPlanEntry = useStore((s) => s.setPlanEntry);
  const plan = useStore((s) => s.plan);

  const slots = useMemo(() => allSlots.slice(0, mealCount), [allSlots, mealCount]);
  const [recipeId, setRecipeId] = useState<string | null>(params.recipeId ?? null);
  const [date, setDate] = useState(params.date ?? today());
  const [slotId, setSlotId] = useState(params.slotId ?? slots[0]?.id ?? '');
  const [servings, setServings] = useState(1);
  const [query, setQuery] = useState('');

  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i));
  if (!days.includes(date)) days.unshift(date);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => !q || r.title.toLowerCase().includes(q)).sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes, query]);

  const chosen = recipes.find((r) => r.id === recipeId);
  // a slot holds one recipe, so saving onto a taken slot replaces it
  const occupied = plan.find((e) => e.date === date && e.slotId === slotId);
  const replaced = occupied && recipes.find((r) => r.id === occupied.recipeId);

  const save = () => {
    if (!chosen) return;
    setPlanEntry({ date, slotId, recipeId: chosen.id, servings });
    router.back();
  };

  return (
    <Page>
      <Stack.Screen options={{ title: t('plan_add_title') }} />

      <View style={styles.section}>
        <ThemedText type="label">{t('recipe')}</ThemedText>
        {chosen ? (
          <Card style={styles.chosen}>
            <ThemedText style={styles.chosenName} numberOfLines={2}>
              {chosen.title}
            </ThemedText>
            <ThemedText color="tint" style={styles.change} onPress={() => setRecipeId(null)}>
              {t('change')}
            </ThemedText>
          </Card>
        ) : (
          <>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search_placeholder')}
              placeholderTextColor={theme.icon}
              style={[styles.search, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            />
            {recipes.length === 0 && <EmptyState emoji="🍽️" title={t('recipes_empty_title')} subtitle={t('plan_no_recipes')} />}
            {matches.map((r) => (
              <Card key={r.id} onPress={() => setRecipeId(r.id)}>
                <ThemedText style={styles.chosenName}>{r.title}</ThemedText>
              </Card>
            ))}
          </>
        )}
      </View>

      {chosen && (
        <>
          <View style={styles.section}>
            <ThemedText type="label">{t('date')}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {days.map((d) => (
                <Chip
                  key={d}
                  label={formatDate(d, locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                  selected={d === date}
                  onPress={() => setDate(d)}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.section}>
            <ThemedText type="label">{t('meal')}</ThemedText>
            <View style={styles.wrap}>
              {slots.map((s, index) => (
                <Chip key={s.id} label={slotName(s, index)} selected={s.id === slotId} onPress={() => setSlotId(s.id)} />
              ))}
            </View>
          </View>
          <View style={[styles.section, styles.servings]}>
            <ThemedText type="label">{t('servings')}</ThemedText>
            <Stepper value={servings} onChange={setServings} format={(v) => `${v}×`} />
          </View>
          {replaced && <ThemedText type="small">{t('plan_replaces', { name: replaced.title })}</ThemedText>}
          <Button label={t('plan_add_confirm')} onPress={save} />
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  servings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  search: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  chosen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  chosenName: { flex: 1, fontWeight: '700' },
  change: { fontWeight: '700' },
});
