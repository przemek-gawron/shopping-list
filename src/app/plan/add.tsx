import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { MenuSections } from '@/components/menu-sections';
import { Page } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ServingsChips, ServingsStepper } from '@/components/servings';
import { Stars } from '@/components/stars';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { byGroupThenTitle, groupForSlot, useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { addDays, formatDate, today } from '@/utils/dates';

/**
 * Adds a recipe, or the name of food ordered in, to a day + meal slot.
 * Opened from the plan (date/slot known) or from a recipe (recipe known).
 */
export default function PlanAddScreen() {
  const params = useLocalSearchParams<{ date?: string; slotId?: string; recipeId?: string }>();
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const slotName = useSlotName();
  const recipes = useStore((s) => s.recipes);
  const groups = useStore((s) => s.groups);
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const setPlanEntry = useStore((s) => s.setPlanEntry);
  const plan = useStore((s) => s.plan);

  const slots = useMemo(() => allSlots.slice(0, mealCount), [allSlots, mealCount]);
  const [recipeId, setRecipeId] = useState<string | null>(params.recipeId ?? null);
  // a meal typed in without a recipe
  const [note, setNote] = useState<string | null>(null);
  // food ordered in (pizza, burgers): typed in or picked from suggestions
  const [mode, setMode] = useState<'recipe' | 'order'>('recipe');
  const [order, setOrder] = useState('');
  const [date, setDate] = useState(params.date ?? today());
  const [slotId, setSlotId] = useState(params.slotId ?? slots[0]?.id ?? '');
  const [servings, setServings] = useState(1);
  const [query, setQuery] = useState('');
  const [showMultipliers, setShowMultipliers] = useState(false);
  // opened from a meal of the plan: start with the recipes of the matching group ("Obiad" -> "Obiady")
  const [groupFilter, setGroupFilter] = useState<string | null>(() => {
    const index = slots.findIndex((s) => s.id === params.slotId);
    return index < 0 ? null : (groupForSlot(slots[index], slotName(slots[index], index), groups)?.id ?? null);
  });

  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i));
  if (!days.includes(date)) days.unshift(date);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter((r) => (!groupFilter || r.groupId === groupFilter) && (!q || r.title.toLowerCase().includes(q)))
      // with a group filter on this is plain alphabetical
      .sort(byGroupThenTitle(groups));
  }, [recipes, groups, query, groupFilter]);

  // names ordered before (latest first), then the defaults
  const suggestions = useMemo(() => {
    const ordered = plan
      .filter((e) => e.ordered && e.note)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => e.note as string);
    const seen = new Set<string>();
    return [...ordered, ...t('plan_order_suggestions').split('|')]
      .filter((name) => !seen.has(name.toLowerCase()) && !!seen.add(name.toLowerCase()))
      .slice(0, 10);
  }, [plan, t]);

  const ordering = mode === 'order';
  const chosen = ordering ? undefined : recipes.find((r) => r.id === recipeId);
  // the name of a meal without a recipe: typed in the search or ordered in
  const name = ordering ? order.trim() || null : note;
  // a meal may have several dishes; the new one is added next to the others
  const inMeal = plan.filter((e) => e.date === date && e.slotId === slotId);
  const already = inMeal.find((e) => (name ? e.note === name : e.recipeId === chosen?.id));
  const others = inMeal
    .filter((e) => (name ? e.note !== name : e.recipeId !== chosen?.id))
    .map((e) => e.note ?? recipes.find((r) => r.id === e.recipeId)?.title)
    .filter(Boolean)
    .join(', ');

  const save = () => {
    if (ordering) {
      if (!name) return;
      setPlanEntry({ date, slotId, note: name, ordered: true, servings: 1 });
    } else if (note) setPlanEntry({ date, slotId, note, servings: 1 });
    else if (chosen) setPlanEntry({ date, slotId, recipeId: chosen.id, servings });
    else return;
    router.back();
  };

  return (
    <Page>
      <Stack.Screen options={{ title: t('plan_add_title') }} />

      {!params.recipeId && (
        <Segmented
          options={[
            { value: 'recipe', label: t('recipe') },
            { value: 'order', label: `🛵 ${t('plan_mode_order')}` },
          ]}
          value={mode}
          onChange={setMode}
        />
      )}

      {ordering ? (
        <View style={styles.section}>
          <ThemedText type="label">{t('plan_order_label')}</ThemedText>
          <TextInput
            value={order}
            onChangeText={setOrder}
            placeholder={t('plan_order_placeholder')}
            placeholderTextColor={theme.icon}
            returnKeyType="done"
            style={[styles.search, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          />
          <View style={styles.wrap}>
            {suggestions.map((s) => (
              <Chip key={s} label={s} selected={order.trim().toLowerCase() === s.toLowerCase()} onPress={() => setOrder(s)} />
            ))}
          </View>
          <ThemedText type="small">{t('plan_order_hint')}</ThemedText>
        </View>
      ) : (
        <View style={styles.section}>
          <ThemedText type="label">{t('recipe')}</ThemedText>
          {chosen || note ? (
            <Card style={styles.chosen} onPress={() => (note ? setNote(null) : setRecipeId(null))}>
              <View style={styles.chosenName}>
                <ThemedText style={styles.chosenTitle} numberOfLines={2}>
                  {note ?? chosen?.title}
                </ThemedText>
                {note && <ThemedText type="caption">✏️ {t('plan_note')}</ThemedText>}
              </View>
              <ThemedText color="tint" style={styles.change} onPress={() => (note ? setNote(null) : setRecipeId(null))}>
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
              {query.trim() ? (
                <Card onPress={() => setNote(query.trim())} style={styles.chosen}>
                  <ThemedText color="tint" style={styles.chosenTitle}>
                    ✏️ {t('plan_note_add', { name: query.trim() })}
                  </ThemedText>
                </Card>
              ) : (
                <ThemedText type="small">{t('plan_note_hint')}</ThemedText>
              )}
              {groups.length > 0 && (
                <View style={styles.wrap}>
                  <Chip label={t('all')} selected={groupFilter === null} onPress={() => setGroupFilter(null)} />
                  {groups.map((g) => (
                    <Chip key={g.id} label={`${g.emoji} ${g.name}`} selected={groupFilter === g.id} onPress={() => setGroupFilter(g.id)} />
                  ))}
                </View>
              )}
              {recipes.length > 0 && matches.length === 0 && <EmptyState emoji="🔎" title={t('recipes_none_found')} />}
              {recipes.length === 0 && <EmptyState emoji="🍽️" title={t('recipes_empty_title')} subtitle={t('plan_no_recipes')} />}
              <MenuSections
                recipes={matches}
                flat={!!query.trim()}
                renderRecipe={(r) => (
                  <Card onPress={() => setRecipeId(r.id)} style={styles.chosen}>
                    <ThemedText style={[styles.chosenName, styles.chosenTitle]}>{r.title}</ThemedText>
                    {r.rating ? <Stars value={r.rating} size={13} /> : null}
                  </Card>
                )}
              />
            </>
          )}
        </View>
      )}

      {(ordering || chosen || note) && (
        <>
          <View style={styles.section}>
            <ThemedText type="label">{t('date')}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chips}>
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
          {/* a meal without a recipe has nothing to multiply */}
          {!ordering && !note && (
            <View style={[styles.section, styles.servings]}>
              <ThemedText type="label">{t('servings')}</ThemedText>
              <ServingsStepper value={servings} onChange={setServings} onValuePress={() => setShowMultipliers(!showMultipliers)} />
            </View>
          )}
          {!ordering && !note && showMultipliers && (
            <ServingsChips
              value={servings}
              onChange={(v) => {
                setServings(v);
                setShowMultipliers(false);
              }}
            />
          )}
          {already ? (
            <ThemedText type="small">
              {/* a meal without a recipe has no servings; saving may turn an ordered one into a typed-in one or back */}
              {!name
                ? t('plan_already_in_meal')
                : !already.ordered === !ordering
                  ? t('plan_note_already_in_meal')
                  : t('plan_note_kind_change', { name, kind: t(ordering ? 'plan_ordered' : 'plan_note'), was: t(already.ordered ? 'plan_ordered_was' : 'plan_note_was') })}
            </ThemedText>
          ) : (
            others && <ThemedText type="small">{t('plan_adds_to', { names: others })}</ThemedText>
          )}
          <Button label={t('plan_add_confirm')} onPress={save} disabled={ordering && !name} />
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
  search: { minHeight: 44, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, fontSize: 16 },
  chosen: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  chosenName: { flex: 1 },
  chosenTitle: { fontWeight: '700' },
  change: { fontWeight: '700' },
});
