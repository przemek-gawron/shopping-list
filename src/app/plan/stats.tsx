import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Page } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { planStats, total, type Counts, type MealKind, type StatsBucket, type StatsRange } from '@/data/stats';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { formatDate, today } from '@/utils/dates';

const RANGES: StatsRange[] = ['7', '30', '90', '365', 'all'];
// stacked bottom to top in this order; also the order of the tiles and the legend
const KINDS: MealKind[] = ['recipe', 'ordered', 'note'];
const EMOJI: Record<MealKind, string> = { recipe: '🍲', ordered: '🛵', note: '✏️' };
const COLOR: Record<MealKind, keyof ThemeColors> = { recipe: 'chartRecipe', ordered: 'chartOrdered', note: 'chartNote' };
const CHART_HEIGHT = 140;

/** Whole percentages that add up to 100 (largest remainders get the leftover points). */
function percents(counts: Counts): Counts {
  const sum = total(counts);
  const result = { recipe: 0, ordered: 0, note: 0 };
  if (!sum) return result;
  const exact = KINDS.map((k) => ({ k, value: (counts[k] / sum) * 100 }));
  for (const { k, value } of exact) result[k] = Math.floor(value);
  let left = 100 - total(result);
  for (const { k } of [...exact].sort((a, b) => (b.value % 1) - (a.value % 1))) if (left-- > 0) result[k]++;
  return result;
}

/** A chart bar that grows up from the axis, a moment after the bar on its left. */
function GrowBar({ height, index, children }: { height: number; index: number; children: ReactNode }) {
  const grown = useSharedValue(0);
  useEffect(() => {
    grown.set(withDelay(Math.min(index, 30) * 18, withTiming(height, { duration: 520, easing: Easing.out(Easing.cubic) })));
  }, [grown, height, index]);
  const style = useAnimatedStyle(() => ({ height: grown.get() }));
  return <Animated.View style={[styles.bar, style]}>{children}</Animated.View>;
}

/** How often meals were cooked from the plan, ordered in or eaten without a recipe, over a chosen period. */
export default function PlanStatsScreen() {
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const plan = useStore((s) => s.plan);
  const recipes = useStore((s) => s.recipes);
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const [range, setRange] = useState<StatsRange>('30');
  const [selected, setSelected] = useState<string | null>(null);

  const stats = useMemo(
    () =>
      planStats(
        plan,
        allSlots.slice(0, mealCount).map((s) => s.id),
        range,
        today(),
      ),
    [plan, allSlots, mealCount, range],
  );
  const shares = percents(stats.counts);
  const previousShares = stats.previous && percents(stats.previous);
  const label = (kind: MealKind) => t(kind === 'recipe' ? 'stats_recipe' : kind === 'ordered' ? 'stats_ordered' : 'plan_note');
  const max = Math.max(1, ...stats.buckets.map((b) => total(b.counts)));
  const bar = stats.buckets.find((b) => b.start === selected);
  // with many bars only every few gets a label under it
  const labelEvery = Math.ceil(stats.buckets.length / 7);

  const bucketLabel = (b: StatsBucket, long = false) => {
    if (stats.granularity === 'day') return formatDate(b.start, locale, long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short' });
    if (stats.granularity === 'month') {
      if (!long) return formatDate(b.start, locale, { month: 'short' });
      const month = (iso: string) => formatDate(iso, locale, { month: 'long', year: 'numeric' });
      // the first bar may hold two months
      return b.start.slice(0, 7) === b.end.slice(0, 7) ? month(b.start) : `${month(b.start)} – ${month(b.end)}`;
    }
    const day = (iso: string) => formatDate(iso, locale, { day: 'numeric', month: long ? 'short' : 'numeric' });
    return long && b.end !== b.start ? `${day(b.start)} – ${day(b.end)}` : day(b.start);
  };
  const countsText = (c: Counts) => KINDS.map((k) => `${EMOJI[k]} ${c[k]}`).join('   ');

  return (
    <Page>
      <Stack.Screen options={{ title: t('stats_title') }} />

      <Segmented
        options={RANGES.map((r) => ({ value: r, label: t(`stats_range_${r}`) }))}
        value={range}
        onChange={(r) => {
          setRange(r);
          setSelected(null);
        }}
      />

      {stats.planned === 0 ? (
        <EmptyState emoji="📊" title={t('stats_empty_title')} subtitle={t('stats_empty_subtitle')} />
      ) : (
        <>
          <View style={styles.tiles}>
            {KINDS.map((kind) => {
              const share = shares[kind];
              const delta = previousShares ? share - previousShares[kind] : null;
              return (
                <Card key={kind} style={styles.tile}>
                  <View style={styles.tileHead}>
                    <View style={[styles.swatch, { backgroundColor: theme[COLOR[kind]] as string }]} />
                    <ThemedText type="caption" numberOfLines={1} style={styles.flex}>
                      {label(kind)}
                    </ThemedText>
                  </View>
                  <ThemedText type="heading">{share}%</ThemedText>
                  <ThemedText type="caption">
                    {EMOJI[kind]} {stats.counts[kind]}
                    {delta !== null && delta !== 0 && `  ${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)} ${t('stats_pp')}`}
                  </ThemedText>
                </Card>
              );
            })}
          </View>
          <ThemedText type="small">
            {t('stats_summary', { planned: stats.planned, unplanned: stats.unplanned })}
            {stats.previous && `\n${t('stats_vs_previous')}`}
          </ThemedText>

          <Card style={styles.section}>
            <ThemedText type="label">{t('stats_chart')}</ThemedText>
            <View style={styles.legend}>
              {KINDS.map((kind) => (
                <View key={kind} style={styles.legendItem}>
                  <View style={[styles.swatch, { backgroundColor: theme[COLOR[kind]] as string }]} />
                  <ThemedText type="caption">{label(kind)}</ThemedText>
                </View>
              ))}
            </View>
            <ThemedText type="caption">{max}</ThemedText>
            <View style={[styles.chart, { borderBottomColor: theme.border }]}>
              {stats.buckets.map((b, index) => {
                const sum = total(b.counts);
                const isSelected = b.start === selected;
                return (
                  <Pressable
                    key={b.start}
                    style={[styles.barSlot, isSelected && { backgroundColor: theme.surfaceCard }]}
                    onPress={() => setSelected(isSelected ? null : b.start)}
                    accessibilityRole="button"
                    accessibilityLabel={`${bucketLabel(b, true)}: ${KINDS.map((k) => `${label(k)} ${b.counts[k]}`).join(', ')}`}>
                    <GrowBar height={(sum / max) * CHART_HEIGHT} index={index}>
                      {KINDS.map((kind) =>
                        b.counts[kind] ? (
                          <View key={kind} style={{ flex: b.counts[kind], backgroundColor: theme[COLOR[kind]] as string }} />
                        ) : null,
                      )}
                    </GrowBar>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.axis}>
              {stats.buckets
                .filter((_, i) => i % labelEvery === 0)
                .map((b, i, shown) => (
                  // each label spans the bars up to the next one
                  <ThemedText
                    key={b.start}
                    type="caption"
                    numberOfLines={1}
                    style={[
                      styles.axisLabel,
                      { flex: i < shown.length - 1 ? labelEvery : stats.buckets.length - i * labelEvery, textAlign: labelEvery === 1 ? 'center' : 'left' },
                    ]}>
                    {bucketLabel(b)}
                  </ThemedText>
                ))}
            </View>
            <ThemedText type="small">{bar ? `${bucketLabel(bar, true)}:  ${countsText(bar.counts)}` : t('stats_tap_bar')}</ThemedText>
          </Card>

          {stats.topOrdered.length > 0 && (
            <Card style={styles.section}>
              <ThemedText type="label">{t('stats_top_ordered')}</ThemedText>
              {stats.topOrdered.map((o) => (
                <View key={o.name} style={styles.row}>
                  <ThemedText style={styles.flex} numberOfLines={1}>
                    🛵 {o.name}
                  </ThemedText>
                  <ThemedText type="small">{o.count}×</ThemedText>
                </View>
              ))}
            </Card>
          )}

          {stats.topRecipes.length > 0 && (
            <Card style={styles.section}>
              <ThemedText type="label">{t('stats_top_recipes')}</ThemedText>
              {stats.topRecipes.map((r) => {
                const recipe = recipes.find((x) => x.id === r.recipeId);
                // a deleted recipe still counts, under its old title, but has nothing to open
                if (!recipe)
                  return r.title ? (
                    <View key={r.recipeId} style={styles.row}>
                      <ThemedText style={styles.flex} numberOfLines={1}>
                        {r.title}
                      </ThemedText>
                      <ThemedText type="small">{r.count}×</ThemedText>
                    </View>
                  ) : null;
                return (
                  <Pressable
                    key={r.recipeId}
                    style={styles.row}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}>
                    <ThemedText color="tint" style={styles.flex} numberOfLines={1}>
                      {recipe.title}
                    </ThemedText>
                    <ThemedText type="small">{r.count}×</ThemedText>
                  </Pressable>
                );
              })}
            </Card>
          )}
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tiles: { flexDirection: 'row', gap: Spacing.two },
  tile: { flex: 1, gap: 2, padding: 10 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  section: { gap: Spacing.two },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chart: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  // segments stack bottom-up with a 2px gap; only the top of the bar is rounded
  bar: { width: '70%', maxWidth: 28, flexDirection: 'column-reverse', gap: 2, borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden' },
  axis: { flexDirection: 'row', gap: 2 },
  axisLabel: { fontSize: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 32 },
});
