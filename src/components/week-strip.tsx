import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, tintFill } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';
import { addDays, formatDate, fromISO, startOfWeek, today } from '@/utils/dates';

const GAP = 6;
/** Days reachable by scrolling, either side of today. */
const RANGE_DAYS = 2 * 365;
const VISIBLE = 7;

type Props = {
  selected: string;
  onSelect: (date: string) => void;
  /** The first day in view, whenever scrolling settles. */
  onVisibleStart: (date: string) => void;
  /** Days with something planned get a dot. */
  hasMeals: (date: string) => boolean;
  /** Scrolls so this day is first in view, each time `key` changes (week arrows, "today"). */
  jump: { date: string; key: number };
};

/**
 * Days of the plan as a strip that scrolls freely sideways, a week in view and snapping to whole days.
 * The week arrows scroll to a Monday; a selected day out of view scrolls its week into view.
 */
export function WeekStrip({ selected, onSelect, onVisibleStart, hasMeals, jump }: Props) {
  const theme = useTheme();
  const locale = useLocale();
  const list = useRef<FlatList<string>>(null);
  const [width, setWidth] = useState(0);
  const first = useMemo(() => addDays(startOfWeek(today()), -RANGE_DAYS), []);
  const days = useMemo(() => Array.from({ length: RANGE_DAYS * 2 }, (_, i) => addDays(first, i)), [first]);
  const indexOf = (date: string) => Math.round((fromISO(date).getTime() - fromISO(first).getTime()) / 86_400_000);
  const dayWidth = width > 0 ? (width - GAP * (VISIBLE - 1)) / VISIBLE : 0;
  const step = dayWidth + GAP;
  const [initialIndex] = useState(() => indexOf(startOfWeek(selected)));
  const visibleIndex = useRef(initialIndex);

  const scrollTo = (index: number) => {
    visibleIndex.current = index;
    list.current?.scrollToOffset({ offset: index * step, animated: true });
    onVisibleStart(days[index]);
  };

  useEffect(() => {
    if (step && jump.key > 0) scrollTo(indexOf(jump.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump.key, step]);

  useEffect(() => {
    if (!step) return;
    const index = indexOf(selected);
    // keep the strip still while the selected day is in view
    if (index < visibleIndex.current || index >= visibleIndex.current + VISIBLE) scrollTo(indexOf(startOfWeek(selected)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, step]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!step) return;
    const index = Math.max(0, Math.round(e.nativeEvent.contentOffset.x / step));
    visibleIndex.current = index;
    onVisibleStart(days[index]);
  };

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {dayWidth > 0 && (
        <FlatList
          ref={list}
          horizontal
          data={days}
          keyExtractor={(d) => d}
          extraData={[selected, hasMeals]}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: step, offset: step * index, index })}
          snapToInterval={step}
          decelerationRate="fast"
          onMomentumScrollEnd={settle}
          onScrollEndDrag={(e) => e.nativeEvent.velocity?.x === 0 && settle(e)}
          windowSize={5}
          initialNumToRender={21}
          renderItem={({ item: date }) => {
            const isSelected = date === selected;
            const isToday = date === today();
            return (
              <Pressable
                onPress={() => onSelect(date)}
                accessibilityRole="button"
                accessibilityLabel={formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                style={[
                  styles.day,
                  { width: dayWidth, marginRight: GAP },
                  isSelected ? tintFill(theme) : { backgroundColor: theme.cardBackground },
                  { borderColor: isToday ? theme.tint : isSelected ? 'transparent' : theme.borderSubtle },
                ]}>
                <ThemedText type="caption" color={isSelected ? 'onPrimary' : 'textSecondary'}>
                  {formatDate(date, locale, { weekday: 'short' })}
                </ThemedText>
                <ThemedText style={styles.dayNumber} color={isSelected ? 'onPrimary' : 'text'}>
                  {fromISO(date).getDate()}
                </ThemedText>
                <View
                  style={[styles.dot, { backgroundColor: hasMeals(date) ? (isSelected ? theme.onPrimary : theme.tint) : 'transparent' }]}
                />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { alignItems: 'center', paddingVertical: 8, borderRadius: Radius.control, borderWidth: 1, gap: 2 },
  dayNumber: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
