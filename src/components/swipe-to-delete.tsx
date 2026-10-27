import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedSwipeable, { SwipeDirection, type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { thresholdTick } from '@/utils/haptics';

const ACTION_WIDTH = 84;
/** Space between the row's edge and its action button. */
const ACTION_GAP = 8;
/** How far the row moves to show an action: the button plus the gap. */
const OPEN_WIDTH = ACTION_WIDTH + ACTION_GAP;
/** The row moves this many times slower than the finger. */
const FRICTION = 1.4;
/** Rows lower than this show only the icon on their swipe actions; the label would be cut. */
const COMPACT_HEIGHT = 44;
/**
 * A swipe released with the row moved past this share of its width deletes at once instead of leaving the
 * button showing; with the drag's friction that is a little under half the row under the finger. Never
 * less than a bit past the open button, so a plain swipe to uncover it does not delete.
 */
const FULL_SWIPE = 0.3;
const fullSwipe = (width: number) => Math.max(OPEN_WIDTH + 24, width * FULL_SWIPE);
/** A swipe right released with the row moved past this completes it: most of the way across the green strip. */
const COMPLETE_AT = ACTION_GAP + ACTION_WIDTH * 0.75;
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

/** A row closed (`swiped`) or went away; only a closing swipe holds the presses right after it. */
function forgetRow(id: symbol, swiped = true) {
  if (rows.delete(id) && swiped) lastSwipeAt = Date.now();
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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const compact = size.height > 0 && size.height < COMPACT_HEIGHT;
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
      // an item completed by a swipe moves to another section a moment later: a tap then is a new one
      forgetRow(id, false);
    };
  }, [id]);

  // a deleted row fades out where it is; one that asks first (an alert) slides back meanwhile
  const remove = () => {
    // the row below takes this one's place under the finger: presses right after belong to the swipe
    lastSwipeAt = Date.now();
    onDelete();
    requestAnimationFrame(close);
  };
  const complete = () => {
    onComplete?.();
    requestAnimationFrame(close);
  };

  const { tracker, fullAt, restOffset } = useArmTracker(!!onComplete, (outcome) => (outcome < 0 ? remove() : complete()));

  return (
    <GestureDetector gesture={tracker}>
      <View style={style}>
        <ReanimatedSwipeable
          ref={swipeable}
          friction={FRICTION}
          rightThreshold={ACTION_WIDTH / 2}
          leftThreshold={ACTION_WIDTH}
          simultaneousWithExternalGesture={tracker}
          containerStyle={[{ borderRadius: radius }, style && styles.fill]}
          onSwipeableOpenStartDrag={moving}
          onSwipeableCloseStartDrag={moving}
          // the resting offset is set as the row starts moving, so a drag begun before it settles still counts
          onSwipeableWillOpen={(direction) => {
            moving();
            // the green strip never stays open: completing is up to the tracker
            if (direction === SwipeDirection.RIGHT) return requestAnimationFrame(close);
            restOffset.set(-OPEN_WIDTH);
          }}
          onSwipeableOpen={() => track(false)}
          onSwipeableWillClose={() => {
            moving();
            restOffset.set(0);
          }}
          onSwipeableClose={() => forgetRow(id)}
          renderLeftActions={onComplete && ((_progress, drag) => <CompleteAction drag={drag} radius={radius} label={completeLabel ?? ''} compact={compact} />)}
          renderRightActions={(_progress, drag) => <DeleteAction drag={drag} radius={radius} onPress={remove} compact={compact} />}>
          <View
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setSize({ width, height });
              fullAt.set(fullSwipe(width));
            }}
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
      </View>
    </GestureDetector>
  );
}

/**
 * Follows the finger next to the swipe itself, on the UI thread: past the full-swipe point (`fullAt`, or to
 * the right past the green strip) it gives a haptic tick and arms the row, and letting go while armed calls
 * `onRelease` with -1 (delete) or 1 (complete). Feel and outcome agree, and nothing ticks once the finger is up.
 */
function useArmTracker(canComplete: boolean, onRelease: (outcome: -1 | 1) => void) {
  const fullAt = useSharedValue(Infinity);
  /** Where the row rests when the drag starts: 0, or the width of the action it was left open on. */
  const restOffset = useSharedValue(0);
  /** -1 armed to delete, 1 armed to complete, 0 neither. */
  const armed = useSharedValue(0);
  // the latest handler, so the gesture itself is built once: a new gesture on every render makes
  // the gesture handler reattach every row's native handlers, which on Android stalls a long list
  const release = useRef(onRelease);
  useLayoutEffect(() => {
    release.current = onRelease;
  });
  // the ref is read when the finger lifts, never while rendering
  /* eslint-disable react-hooks/refs */
  const tracker = useMemo(() => {
    const onArmedRelease = (outcome: -1 | 1) => release.current(outcome);
    return Gesture.Pan()
      .activeOffsetX([-10, 10])
      .onUpdate((e) => {
        const x = e.translationX / FRICTION + restOffset.get();
        const next = x < -fullAt.get() ? -1 : canComplete && x > COMPLETE_AT ? 1 : 0;
        if (next === armed.get()) return;
        armed.set(next);
        runOnJS(thresholdTick)(next !== 0);
      })
      .onEnd(() => {
        const outcome = armed.get();
        armed.set(0);
        if (outcome !== 0) runOnJS(onArmedRelease)(outcome as -1 | 1);
      });
  }, [canComplete, armed, fullAt, restOffset]);
  /* eslint-enable react-hooks/refs */
  return { tracker, fullAt, restOffset };
}

type ActionProps = { drag: SharedValue<number>; radius: number; compact: boolean };

function DeleteAction({ drag, radius, onPress, compact }: ActionProps & { onPress: () => void }) {
  const theme = useTheme();
  const t = useT();
  // the button follows the row's edge a gap behind it, and stretches when the row is pulled further
  const style = useAnimatedStyle(() => ({
    width: Math.max(OPEN_WIDTH, -drag.value),
    transform: [{ translateX: Math.max(0, drag.value + OPEN_WIDTH) }],
  }));
  return (
    <Animated.View style={[styles.slot, styles.deleteSlot, style]}>
      <View style={[styles.action, { backgroundColor: theme.destructive, borderRadius: radius }]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={t('delete')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <IconSymbol name="trash" size={20} color={theme.onPrimary} />
          {!compact && <Text style={[styles.label, { color: theme.onPrimary }]}>{t('delete')}</Text>}
        </Pressable>
      </View>
    </Animated.View>
  );
}

/** Green strip uncovered by a swipe right; the row completes as soon as the finger lifts past it. */
function CompleteAction({ drag, radius, label, compact }: ActionProps & { label: string }) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => ({
    width: Math.max(OPEN_WIDTH, drag.value),
    transform: [{ translateX: Math.min(0, drag.value - OPEN_WIDTH) }],
  }));
  return (
    <Animated.View style={[styles.slot, styles.completeSlot, style]}>
      <View style={[styles.action, styles.complete, { backgroundColor: theme.tint, borderRadius: radius }]}>
        <View style={styles.button}>
          <IconSymbol name="checkmark" size={20} color={theme.onPrimary} />
          {!compact && (
            <Text style={[styles.label, { color: theme.onPrimary }]} numberOfLines={1}>
              {label}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1 },
  /** Holds the button and the gap beside it; only the button is coloured. */
  slot: { height: '100%' },
  deleteSlot: { paddingLeft: ACTION_GAP },
  completeSlot: { paddingRight: ACTION_GAP },
  complete: { alignItems: 'flex-end' },
  action: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  button: { width: ACTION_WIDTH, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  pressed: { opacity: 0.7 },
  label: { fontSize: 13, fontWeight: '700' },
});
