import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, type SharedValue } from 'react-native-reanimated';

import { Backdrop, type BackdropShape } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** How far each shape drifts per pixel scrolled; they differ so the shapes look layered. */
const DEPTHS = [0.12, 0.2, 0.08, 0.16];
/** Scrolling past this (or pulling down past its minus) moves the shapes no further. */
const MAX_SCROLL = 900;
const MAX_PULL = 200;

/**
 * The theme's decorative shapes behind a screen. With `scrollY` (the content's scroll offset) they
 * drift up slower than the content, a gentle parallax; otherwise, and with reduced motion, they stay
 * put. Nothing moves while the screen is still: an endless animation here holds up the screens'
 * layout animations, leaving cards half faded in or out of place.
 */
export function BackdropLayer({ scrollY }: { scrollY?: SharedValue<number> }) {
  const shapes = Backdrop[useColorScheme()];
  const reduceMotion = useReducedMotion();
  if (shapes.length === 0) return null;
  const moving = reduceMotion ? undefined : scrollY;
  return (
    <View pointerEvents="none" style={styles.layer}>
      {shapes.map((shape, i) => (
        <Shape key={i} shape={shape} depth={DEPTHS[i % DEPTHS.length]} scrollY={moving} />
      ))}
    </View>
  );
}

function Shape({ shape, depth, scrollY }: { shape: BackdropShape; depth: number; scrollY?: SharedValue<number> }) {
  const rotate = `${shape.rotate ?? 0}deg`;
  const drift = useAnimatedStyle(() => {
    const y = scrollY ? interpolate(scrollY.value, [-MAX_PULL, MAX_SCROLL], [MAX_PULL, -MAX_SCROLL], 'clamp') : 0;
    return { transform: [{ translateY: y * depth }, { rotate }] };
  });
  return <Animated.View style={[styles.shape, shape.style, drift]} />;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  shape: { position: 'absolute' },
});
