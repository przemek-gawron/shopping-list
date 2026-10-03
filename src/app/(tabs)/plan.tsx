import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { ServingsChips, ServingsStepper } from '@/components/servings';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WeekStrip } from '@/components/week-strip';
import { Spacing, tintFill } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { appliedSwaps } from '@/data/shopping';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { confirm } from '@/utils/confirm';
import { addDays, formatDate, startOfWeek, today, weekDays } from '@/utils/dates';

export default function PlanScreen() {
  const theme = useTheme();
  const t = useT();
  const locale = useLocale();
  const slotName = useSlotName();
  const plan = useStore((s) => s.plan);
  const recipes = useStore((s) => s.recipes);
  const products = useStore((s) => s.products);
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const list = useStore((s) => s.list);
  const updatePlanEntry = useStore((s) => s.updatePlanEntry);
  const removePlanEntry = useStore((s) => s.removePlanEntry);
  const generateList = useStore((s) => s.generateList);
  const clearPlan = useStore((s) => s.clearPlan);

  const slots = useMemo(() => allSlots.slice(0, mealCount), [allSlots, mealCount]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [picked, setPicked] = useState<string[]>([]);
  /** Plan entry whose multiplier choices are open. */
  const [editing, setEditing] = useState<string | null>(null);

  const weekStart = startOfWeek(selectedDate);
  const days = weekDays(weekStart);
  const visibleSlotIds = useMemo(() => new Set(slots.map((s) => s.id)), [slots]);
  // entries of slots that are currently hidden stay stored but are not shown or shoppable
  const shown = useMemo(() => plan.filter((e) => visibleSlotIds.has(e.slotId)), [plan, visibleSlotIds]);
  const pickedShown = picked.filter((id) => shown.some((e) => e.id === id));

  const weekLabel = `${formatDate(days[0], locale, { day: 'numeric', month: 'short' })} – ${formatDate(days[6], locale, { day: 'numeric', month: 'short' })}`;
  const dayEntries = (date: string) => shown.filter((e) => e.date === date);
  const weekEntries = shown.filter((e) => e.date >= days[0] && e.date <= days[6]);

  const select = (ids: string[]) => setPicked(ids);
  const idsFor = (predicate: (date: string) => boolean) => shown.filter((e) => predicate(e.date)).map((e) => e.id);

  const toggle = (id: string) =>
    setPicked((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const generate = () => {
    const run = () => {
      generateList(pickedShown);
      setPicked([]);
      router.navigate('/list');
    };
    if (list.length === 0) return run();
    Alert.alert(t('plan_replace_title'), t('plan_replace_message'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('plan_replace_confirm'), style: 'destructive', onPress: run },
    ]);
  };

  return (
    <Screen
      title={t('plan_title')}
      action={
        <Pressable
          onPress={() => router.push({ pathname: '/plan/random', params: { date: selectedDate } })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.random, tintFill(theme), pressed && { opacity: 0.7 }]}>
          <ThemedText color="onPrimary" style={styles.randomLabel}>
            🎲 {t('random_title')}
          </ThemedText>
        </Pressable>
      }>
      <View style={styles.weekNav}>
        <Pressable hitSlop={10} accessibilityRole="button" onPress={() => setSelectedDate(addDays(weekStart, -7))} accessibilityLabel={t('plan_prev_week')}>
          <IconSymbol name="chevron.left" size={22} color={theme.tint} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setSelectedDate(today())} accessibilityLabel={t('plan_today')}>
          <ThemedText type="heading">{weekLabel}</ThemedText>
        </Pressable>
        <Pressable hitSlop={10} accessibilityRole="button" onPress={() => setSelectedDate(addDays(weekStart, 7))} accessibilityLabel={t('plan_next_week')}>
          <IconSymbol name="chevron.right" size={22} color={theme.tint} />
        </Pressable>
      </View>

      <WeekStrip
        days={days}
        selected={selectedDate}
        onSelect={setSelectedDate}
        onSwipe={(direction) => setSelectedDate(addDays(weekStart, 7 * direction))}
        hasMeals={(date) => dayEntries(date).length > 0}
      />

      <ThemedText type="heading">
        {formatDate(selectedDate, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
      </ThemedText>

      {slots.map((slot, index) => {
        const entry = dayEntries(selectedDate).find((e) => e.slotId === slot.id);
        const recipe = entry && recipes.find((r) => r.id === entry.recipeId);
        const isPicked = !!entry && picked.includes(entry.id);
        const swapCount = entry ? appliedSwaps(entry, recipe, products).length : 0;
        const action = entry ? t('change') : `+ ${t('plan_add_meal')}`;
        return (
          <Card key={slot.id} style={styles.slot}>
            <View style={styles.slotHeader}>
              <ThemedText type="label">{slotName(slot, index)}</ThemedText>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/plan/add', params: { date: selectedDate, slotId: slot.id } })}
                accessibilityLabel={`${entry ? t('change') : t('plan_add_meal')} – ${slotName(slot, index)}`}>
                <ThemedText color="tint" style={styles.addLink}>
                  {action}
                </ThemedText>
              </Pressable>
            </View>
            {entry ? (
              <>
                <View style={styles.entry}>
                  <Pressable
                    onPress={() => toggle(entry.id)}
                    hitSlop={8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isPicked }}
                    accessibilityLabel={t('plan_pick_for_list')}
                    style={[styles.checkbox, { borderColor: theme.tint, backgroundColor: isPicked ? theme.tint : 'transparent' }]}>
                    {isPicked && <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />}
                  </Pressable>
                  <Pressable
                    style={styles.entryTitle}
                    accessibilityRole="button"
                    onPress={() => recipe && router.push({ pathname: '/recipe/[id]', params: { id: recipe.id, entryId: entry.id } })}>
                    <ThemedText style={styles.entryName} numberOfLines={2}>
                      {recipe?.title ?? '?'}
                    </ThemedText>
                    {swapCount > 0 && (
                      <ThemedText type="caption" color="tint">
                        {t('swap_count', { count: swapCount })}
                      </ThemedText>
                    )}
                  </Pressable>
                  <ServingsStepper
                    value={entry.servings}
                    onChange={(v) => updatePlanEntry(entry.id, v)}
                    onValuePress={() => setEditing(editing === entry.id ? null : entry.id)}
                  />
                  <Pressable hitSlop={8} accessibilityRole="button" onPress={() => removePlanEntry(entry.id)} accessibilityLabel={t('delete')}>
                    <IconSymbol name="xmark" size={18} color={theme.icon} />
                  </Pressable>
                </View>
                {editing === entry.id && (
                  <ServingsChips
                    value={entry.servings}
                    onChange={(v) => {
                      updatePlanEntry(entry.id, v);
                      setEditing(null);
                    }}
                  />
                )}
              </>
            ) : (
              <ThemedText type="small">{t('plan_slot_empty')}</ThemedText>
            )}
          </Card>
        );
      })}

      {shown.length > 0 && (
        <View style={styles.generate}>
          <ThemedText type="label">{t('plan_pick_title')}</ThemedText>
          <View style={styles.chips}>
            <Chip label={t('plan_pick_day')} onPress={() => select(idsFor((d) => d === selectedDate))} />
            <Chip label={t('plan_pick_week')} onPress={() => select(idsFor((d) => d >= days[0] && d <= days[6]))} />
            <Chip label={t('plan_pick_from_today')} onPress={() => select(idsFor((d) => d >= today()))} />
            <Chip label={t('plan_pick_none')} onPress={() => select([])} />
          </View>
          <Button
            label={pickedShown.length > 0 ? t('plan_generate_count', { count: pickedShown.length }) : t('plan_generate')}
            onPress={generate}
            disabled={pickedShown.length === 0}
          />
        </View>
      )}

      {weekEntries.length > 0 && (
        <View style={styles.generate}>
          <ThemedText type="label">{t('plan_clear_title')}</ThemedText>
          <View style={styles.chips}>
            {dayEntries(selectedDate).length > 0 && (
              <Chip
                label={t('plan_clear_day')}
                onPress={() =>
                  confirm(
                    t('plan_clear_title'),
                    t('plan_clear_day_message', { date: formatDate(selectedDate, locale, { weekday: 'long', day: 'numeric', month: 'long' }) }),
                    t('plan_clear_confirm'),
                    t('cancel'),
                    () => clearPlan(selectedDate, selectedDate),
                  )
                }
              />
            )}
            <Chip
              label={t('plan_clear_week')}
              onPress={() =>
                confirm(t('plan_clear_title'), t('plan_clear_week_message', { range: weekLabel }), t('plan_clear_confirm'), t('cancel'), () =>
                  clearPlan(days[0], days[6]),
                )
              }
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  random: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  randomLabel: { fontWeight: '700', fontSize: 14 },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slot: { gap: Spacing.two },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addLink: { fontSize: 14, fontWeight: '700' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 2 },
  entryTitle: { flex: 1 },
  entryName: { fontWeight: '600' },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  generate: { gap: Spacing.two, marginTop: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
