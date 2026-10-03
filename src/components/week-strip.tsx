import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Radius, tintFill } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';
import { formatDate, fromISO, today } from '@/utils/dates';

/** How far (px) or how fast (px/s) a swipe must go to change the week. */
const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 500;

type Props = {
  days: string[];
  selected: string;
  onSelect: (date: string) => void;
  /** -1 for the previous week, 1 for the next one. */
  onSwipe: (direction: -1 | 1) => void;
  /** Days with something planned get a dot. */
  hasMeals: (date: string) => boolean;
};

/** The seven days of a week; swiping it sideways moves to the previous or next week. */
export function WeekStrip({ days, selected, onSelect, onSwipe, hasMeals }: Props) {
  const theme = useTheme();
  const locale = useLocale();
  const offset = useSharedValue(0);

  const swipe = Gesture.Pan()
    // horizontal only, so the screen still scrolls vertically over the strip
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      offset.value = e.translationX;
    })
    .onEnd((e) => {
      const next = e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY;
      const previous = e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY;
      if (!next && !previous) {
        offset.value = withTiming(0, { duration: 150 });
        return;
      }
      const direction = next ? 1 : -1;
      scheduleOnRN(onSwipe, direction);
      // the new week slides in from the side the finger moved away from
      offset.value = withSequence(withTiming(direction * 60, { duration: 0 }), withTiming(0, { duration: 180 }));
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View style={[styles.days, style]}>
        {days.map((date) => {
          const isSelected = date === selected;
          const isToday = date === today();
          return (
            <Pressable
              key={date}
              onPress={() => onSelect(date)}
              accessibilityRole="button"
              accessibilityLabel={formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              style={[
                styles.day,
                isSelected ? tintFill(theme) : { backgroundColor: theme.cardBackground, boxShadow: theme.cardShadow },
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
        })}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.control, borderWidth: 1, gap: 2 },
  dayNumber: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
