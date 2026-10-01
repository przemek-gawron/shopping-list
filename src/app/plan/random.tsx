import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Page } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { groupForSlot, useSlotName } from '@/data/labels';
import { randomPlan } from '@/data/random-plan';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { addDays, startOfWeek, today, weekDays } from '@/utils/dates';

type Range = 'day' | 'week' | 'next7';
const OWN = 'own';

/** Fills the plan with random recipes from each meal's group, optionally only from chosen meal plans. */
export default function RandomPlanScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const t = useT();
  const theme = useTheme();
  const slotName = useSlotName();
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const groups = useStore((s) => s.groups);
  const recipes = useStore((s) => s.recipes);
  const menus = useStore((s) => s.menus);
  const plan = useStore((s) => s.plan);
  const setPlanEntries = useStore((s) => s.setPlanEntries);

  const date = params.date ?? today();
  const slots = useMemo(() => allSlots.slice(0, mealCount), [allSlots, mealCount]);
  const [range, setRange] = useState<Range>('week');
  const [chosenSlots, setChosenSlots] = useState<string[]>(() => slots.map((s) => s.id));
  const [chosenMenus, setChosenMenus] = useState<string[]>(() => [...menus.map((m) => m.id), OWN]);
  const [replace, setReplace] = useState(false);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const dates = range === 'day' ? [date] : range === 'week' ? weekDays(startOfWeek(date)) : Array.from({ length: 7 }, (_, i) => addDays(date, i));

  const knownMenus = new Set(menus.map((m) => m.id));
  const fromChosenMenus = (menuIds: string[] | undefined) => {
    if (menus.length === 0) return true;
    const own = !menuIds?.some((id) => knownMenus.has(id));
    return own ? chosenMenus.includes(OWN) : menuIds!.some((id) => chosenMenus.includes(id));
  };

  // each meal draws from the recipe group that matches it (Obiad -> Obiady)
  const pools = slots.map((slot, index) => {
    const group = groupForSlot(slot, slotName(slot, index), groups);
    const recipeIds = group ? recipes.filter((r) => r.groupId === group.id && fromChosenMenus(r.menuIds)).map((r) => r.id) : [];
    return { slot, index, group, recipeIds };
  });

  const draw = () => {
    const selected = pools.filter((p) => chosenSlots.includes(p.slot.id));
    const entries = randomPlan({ dates, slots: selected.map((p) => ({ id: p.slot.id, recipeIds: p.recipeIds })), plan, replace });
    setPlanEntries(entries);
    const empty = selected.filter((p) => p.recipeIds.length === 0).map((p) => slotName(p.slot, p.index));
    Alert.alert(
      t('random_done', { count: entries.length }),
      empty.length > 0 ? t('random_no_recipes', { meals: empty.join(', ') }) : undefined,
    );
    router.back();
  };

  return (
    <Page>
      <Stack.Screen options={{ title: t('random_title') }} />
      <ThemedText type="small">{t('random_hint')}</ThemedText>

      <View style={styles.section}>
        <ThemedText type="label">{t('random_range')}</ThemedText>
        <Segmented<Range>
          value={range}
          onChange={setRange}
          options={[
            { value: 'day', label: t('random_range_day') },
            { value: 'week', label: t('random_range_week') },
            { value: 'next7', label: t('random_range_next7') },
          ]}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="label">{t('random_meals')}</ThemedText>
        <View style={styles.wrap}>
          {pools.map((p) => (
            <Chip
              key={p.slot.id}
              label={`${slotName(p.slot, p.index)}${p.group ? ` · ${p.group.emoji} ${p.recipeIds.length}` : ` · ${t('random_no_group')}`}`}
              selected={chosenSlots.includes(p.slot.id)}
              onPress={() => setChosenSlots(toggle(chosenSlots, p.slot.id))}
            />
          ))}
        </View>
      </View>

      {menus.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="label">{t('random_menus')}</ThemedText>
          <View style={styles.wrap}>
            {menus.map((m) => (
              <Chip key={m.id} label={m.name} selected={chosenMenus.includes(m.id)} onPress={() => setChosenMenus(toggle(chosenMenus, m.id))} />
            ))}
            <Chip label={t('menu_own')} selected={chosenMenus.includes(OWN)} onPress={() => setChosenMenus(toggle(chosenMenus, OWN))} />
          </View>
        </View>
      )}

      <View style={styles.row}>
        <ThemedText style={styles.flex}>{t('random_replace')}</ThemedText>
        <Switch value={replace} onValueChange={setReplace} trackColor={{ true: theme.tint }} accessibilityLabel={t('random_replace')} />
      </View>

      <Button label={t('random_draw')} onPress={draw} disabled={chosenSlots.length === 0} />
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1, fontWeight: '600' },
});
