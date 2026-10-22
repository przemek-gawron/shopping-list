import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { LayoutAnimationConfig, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AddButton } from '@/components/add-button';
import { Card } from '@/components/card';
import { Celebration } from '@/components/celebration';
import { Checkbox } from '@/components/checkbox';
import { Chip } from '@/components/chip';
import { Columns } from '@/components/columns';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { SwipeToDelete, unlessSwiping } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UndoButton } from '@/components/undo-button';
import { DEPARTMENTS } from '@/constants/departments';
import { Motion, quickEnter, quickExit, quickLayout } from '@/constants/motion';
import { Radius, Spacing, tintFill } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { ListItem, Recipe } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useFormatAmount, useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

/** How long a ticked (or unticked) item shows its new state before it moves to its section. */
const MOVE_DELAY_MS = 220;
/** Moves waiting for MOVE_DELAY_MS, by item id. Outside the component: there is one list screen. */
const moveTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** "Pancakes ×2, Omelette": the recipes of an item's meals, each once, under their current titles. */
function sourceTitles(item: ListItem, recipes: Recipe[]) {
  const counts = new Map<string, number>();
  for (const source of item.sources ?? []) {
    const title = recipes.find((r) => r.id === source.recipeId)?.title ?? source.title;
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }
  return [...counts].map(([title, count]) => (count > 1 ? `${title} ×${count}` : title)).join(', ');
}

export default function ListScreen() {
  const theme = useTheme();
  const t = useT();
  const formatAmount = useFormatAmount();
  const list = useStore((s) => s.list);
  const recipes = useStore((s) => s.recipes);
  const toggle = useStore((s) => s.toggleListItem);
  const remove = useStore((s) => s.removeListItem);
  const clearChecked = useStore((s) => s.clearChecked);
  const clearList = useStore((s) => s.clearList);
  const undo = useStore((s) => s.undoList);
  const canUndo = useStore((s) => s.listHistory.length > 0);

  const sections = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        ...d,
        items: list.filter((i) => i.departmentId === d.id && !i.checked),
      })).filter((s) => s.items.length > 0),
    [list],
  );
  const checked = useMemo(() => list.filter((i) => i.checked), [list]);
  const done = checked.length;
  const complete = list.length > 0 && done === list.length;

  const copy = async () => {
    const lines = [...sections.flatMap((s) => s.items), ...checked].map(
      (i) => `${i.checked ? '[x]' : '[ ]'} ${i.name}: ${formatAmount(i.quantity, i.unit)}`,
    );
    await Clipboard.setStringAsync(lines.join('\n'));
    Alert.alert(t('list_copied'));
  };

  // a ticked item first shows the tick, then moves to "Bought"; tapping again meanwhile cancels the move
  const [flipping, setFlipping] = useState<string[]>([]);
  const settle = (id: string) => {
    moveTimers.delete(id);
    setFlipping((ids) => ids.filter((x) => x !== id));
  };
  const toggleSoon = (id: string) => {
    const pending = moveTimers.get(id);
    clearTimeout(pending);
    if (pending) return settle(id);
    setFlipping((ids) => [...ids, id]);
    moveTimers.set(
      id,
      setTimeout(() => {
        settle(id);
        toggle(id);
      }, MOVE_DELAY_MS),
    );
  };
  // moves still waiting when the screen goes away happen at once
  useEffect(
    () => () => {
      moveTimers.forEach((timer, id) => {
        clearTimeout(timer);
        toggle(id);
      });
      moveTimers.clear();
    },
    [toggle],
  );

  const progress = useAnimatedStyle(() => ({
    transform: [{ scaleX: withTiming(list.length ? done / list.length : 0, { duration: Motion.normal }) }],
  }));

  // checking an item moves it to another section: it fades out of one and into the other
  const row = (item: ListItem) => {
    const shownChecked = item.checked !== flipping.includes(item.id);
    return (
      <Animated.View key={item.id} entering={quickEnter} exiting={quickExit} layout={quickLayout}>
        <SwipeToDelete
          radius={Radius.control}
          onDelete={() => remove(item.id)}
          onComplete={() => toggleSoon(item.id)}
          completeLabel={item.checked ? t('list_uncheck') : t('list_checked')}>
          <View style={styles.item}>
            <Checkbox checked={shownChecked} onPress={unlessSwiping(() => toggleSoon(item.id))} accessibilityLabel={item.name} />
            <View style={styles.itemText}>
              {/* tapping the name or amount opens the item for editing */}
              <Pressable
                style={({ pressed }) => [styles.itemBody, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`${t('list_edit')} – ${item.name}`}
                onPress={unlessSwiping(() => router.push({ pathname: '/list/add', params: { id: item.id } }))}>
                <ThemedText style={[styles.itemName, shownChecked && styles.doneText]} color={shownChecked ? 'textSecondary' : 'text'}>
                  {item.name}
                </ThemedText>
                <ThemedText type="small" style={shownChecked && styles.doneText}>
                  {formatAmount(item.quantity, item.unit)}
                </ThemedText>
              </Pressable>
              {/* the recipes that need the item; tapping them shows the meals and amounts */}
              {item.sources && item.sources.length > 0 && (
                <Pressable
                  style={({ pressed }) => pressed && styles.pressed}
                  hitSlop={{ top: 4, bottom: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('list_sources_open', { name: item.name })}: ${sourceTitles(item, recipes)}`}
                  onPress={unlessSwiping(() => router.push({ pathname: '/list/sources', params: { id: item.id } }))}>
                  <ThemedText type="caption" color={shownChecked ? 'textSecondary' : 'tint'} numberOfLines={1}>
                    {sourceTitles(item, recipes)}
                  </ThemedText>
                </Pressable>
              )}
            </View>
            <Pressable hitSlop={8} accessibilityRole="button" onPress={unlessSwiping(() => remove(item.id))} accessibilityLabel={t('delete')}>
              <IconSymbol name="xmark" size={18} color={theme.icon} />
            </Pressable>
          </View>
        </SwipeToDelete>
      </Animated.View>
    );
  };

  return (
    <Screen
      wide
      title={t('list_title')}
      action={
        <View style={styles.headerActions}>
          {canUndo && <UndoButton onPress={undo} accessibilityLabel={t('list_undo')} />}
          <AddButton onPress={() => router.push('/list/add')} accessibilityLabel={t('list_add')} />
        </View>
      }>
      {list.length === 0 ? (
        <EmptyState emoji="🛒" title={t('list_empty_title')} subtitle={t('list_empty_subtitle')} />
      ) : (
        // the rows already on screen when the tab opens stay still; later changes animate
        <LayoutAnimationConfig skipEntering>
          <Card style={styles.progress}>
            {/* everything bought: a burst of emoji and a word of praise */}
            {complete && <Celebration />}
            <View style={styles.progressText}>
              <ThemedText type="label">{complete ? `🎉 ${t('list_all_done')}` : t('list_progress')}</ThemedText>
              <ThemedText style={styles.count}>
                {done} / {list.length}
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.surfaceCard }]}>
              <Animated.View style={[styles.fill, tintFill(theme), { boxShadow: undefined }, progress]} />
            </View>
          </Card>

          <View style={styles.actions}>
            <Chip label={t('list_copy')} onPress={() => void copy()} />
            {done > 0 && <Chip label={t('list_clear_checked')} onPress={clearChecked} />}
            <Chip
              label={t('list_clear')}
              onPress={() => confirm(t('list_clear'), t('list_clear_message'), t('delete'), t('cancel'), clearList)}
            />
          </View>

          {/* departments side by side on tablets; the label row counts as one item */}
          <Columns
            blocks={[
              ...sections.map((section) => ({
                key: section.id,
                weight: section.items.length + 1,
                node: (
                  <Card style={styles.section}>
                    <ThemedText type="label">
                      {section.emoji} {t(`dept_${section.id}`)}
                    </ThemedText>
                    {section.items.map(row)}
                  </Card>
                ),
              })),
              ...(checked.length > 0
                ? [
                    {
                      key: 'checked',
                      weight: checked.length + 1,
                      node: (
                        <Card style={styles.section}>
                          <ThemedText type="label">✅ {t('list_checked')}</ThemedText>
                          {checked.map(row)}
                        </Card>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </LayoutAnimationConfig>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  progress: { gap: Spacing.two },
  progressText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontWeight: '700' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { width: '100%', height: '100%', borderRadius: 3, transformOrigin: 'left' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  section: { gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 4 },
  itemBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: 0.6 },
  itemText: { flex: 1, gap: 2 },
  itemName: { flex: 1, fontWeight: '600' },
  doneText: { textDecorationLine: 'line-through' },
});
