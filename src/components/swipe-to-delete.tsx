import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import ReanimatedSwipeable, { SwipeDirection, type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

const ACTION_WIDTH = 84;
/** A swipe released past this share of the row deletes at once instead of leaving the button showing. */
const FULL_SWIPE = 0.5;
/** Presses right after a swipe ends belong to that swipe. */
const SETTLE_MS = 350;

/**
 * Rows that are moving (dragged, or animating after the finger lifted) or left open. On iOS a press
 * inside a row still fires when the finger lifts after a swipe, so presses check `unlessSwiping` first.
 */
const rows = new Map<symbol, { moving: boolean; close: () => void }>();
let lastSwipeAt = 0;

function setRow(id: symbol, moving: boolean, close: () => void) {
  rows.set(id, { moving, close });
  lastSwipeAt = Date.now();
}

function forgetRow(id: symbol) {
  if (rows.delete(id)) lastSwipeAt = Date.now();
}

/**
 * Wraps a press handler so it does nothing while a row is being swiped or just after; with a row left
 * open, the press closes it instead, as tapping outside an open row does in iOS lists.
 */
export function unlessSwiping<A extends unknown[]>(handler: (...args: A) => void) {
  return (...args: A) => {
    if (Date.now() - lastSwipeAt < SETTLE_MS || [...rows.values()].some((r) => r.moving)) return;
    if (rows.size > 0) return rows.forEach((r) => r.close());
    handler(...args);
  };
}

type Props = {
  children: ReactNode;
  /**
   * Deletes the row. Deletions that ask first (`confirm`) get the row back in place right away;
   * the alert decides the rest.
   */
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
  /** Rounds the red action to match a card. */
  radius?: number;
  /** Swiping right runs this at once (e.g. checking an item off); `completeLabel` names it. */
  onComplete?: () => void;
  completeLabel?: string;
};

/**
 * Swipe left to delete: a short swipe uncovers a "Delete" button, a long one deletes straight away.
 * With `onComplete`, swiping right completes the row. Screen readers get the same actions on the row
 * instead of the gestures.
 */
export function SwipeToDelete({ children, onDelete, style, radius = 0, onComplete, completeLabel }: Props) {
  const t = useT();
  const swipeable = useRef<SwipeableMethods>(null);
  const translation = useRef<SharedValue<number>>(null);
  const [width, setWidth] = useState(0);
  const [id] = useState(() => Symbol('row'));
  const close = () => swipeable.current?.close();
  // a row deleted or left behind while open must not keep blocking presses, even when its
  // animation reports back after it is gone
  const mounted = useRef(true);
  const track = (moving: boolean) => mounted.current && setRow(id, moving, close);
  const moving = () => track(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      forgetRow(id);
    };
  }, [id]);

  // a deleted row fades out where it is; one that asks first (an alert) slides back meanwhile
  const remove = () => {
    onDelete();
    requestAnimationFrame(() => swipeable.current?.close());
  };

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={1.4}
      rightThreshold={ACTION_WIDTH / 2}
      containerStyle={[{ borderRadius: radius }, style]}
      onSwipeableOpenStartDrag={moving}
      onSwipeableCloseStartDrag={moving}
      onSwipeableWillOpen={(direction) => {
        moving();
        if (direction === SwipeDirection.RIGHT) {
          onComplete?.();
          requestAnimationFrame(close);
          return;
        }
        if (width > 0 && -(translation.current?.value ?? 0) > width * FULL_SWIPE) remove();
      }}
      onSwipeableOpen={() => track(false)}
      onSwipeableWillClose={moving}
      onSwipeableClose={() => forgetRow(id)}
      leftThreshold={ACTION_WIDTH}
      renderLeftActions={onComplete && ((_progress, drag) => <CompleteAction drag={drag} radius={radius} label={completeLabel ?? ''} />)}
      renderRightActions={(_progress, drag) => {
        translation.current = drag;
        return <DeleteAction drag={drag} radius={radius} onPress={remove} />;
      }}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible={false}
        accessibilityActions={[
          { name: 'delete', label: t('delete') },
          ...(onComplete ? [{ name: 'complete', label: completeLabel }] : []),
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'delete') onDelete();
          if (e.nativeEvent.actionName === 'complete') onComplete?.();
        }}>
        {children}
      </View>
    </ReanimatedSwipeable>
  );
}

function DeleteAction({ drag, radius, onPress }: { drag: SharedValue<number>; radius: number; onPress: () => void }) {
  const theme = useTheme();
  const t = useT();
  // the button follows the row's edge, and stretches over the gap when the row is pulled further
  const style = useAnimatedStyle(() => ({
    width: Math.max(ACTION_WIDTH, -drag.value),
    transform: [{ translateX: Math.max(0, drag.value + ACTION_WIDTH) }],
  }));
  return (
    <Animated.View style={[styles.action, { backgroundColor: theme.destructive, borderRadius: radius }, style]}>
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <IconSymbol name="trash" size={20} color={theme.onPrimary} />
        <Text style={[styles.label, { color: theme.onPrimary }]}>{t('delete')}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Green strip uncovered by a swipe right; the row completes as soon as the finger lifts past it. */
function CompleteAction({ drag, radius, label }: { drag: SharedValue<number>; radius: number; label: string }) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => ({
    width: Math.max(ACTION_WIDTH, drag.value),
    transform: [{ translateX: Math.min(0, drag.value - ACTION_WIDTH) }],
  }));
  return (
    <Animated.View style={[styles.action, styles.complete, { backgroundColor: theme.tint, borderRadius: radius }, style]}>
      <View style={styles.button}>
        <IconSymbol name="checkmark" size={20} color={theme.onPrimary} />
        <Text style={[styles.label, { color: theme.onPrimary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  complete: { alignItems: 'flex-end' },
  action: { height: '100%', alignItems: 'flex-start', justifyContent: 'center' },
  button: { width: ACTION_WIDTH, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  pressed: { opacity: 0.7 },
  label: { fontSize: 13, fontWeight: '700' },
});
