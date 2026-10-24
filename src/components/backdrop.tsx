import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, type SharedValue } from 'react-native-reanimated';

import { Backdrop, type BackdropShape } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** How far each shape drifts per pixel scrolled; they differ so the shapes look layered. */
const DEPTHS = [0.12, 0.2, 0.08, 0.16];
/** Each shape is drawn this many window heights down too, so the drift can loop without a seam. */
const COPIES = [0, 1, 2];

/**
 * The theme's decorative shapes behind a screen. With `scrollY` (the content's scroll offset) they
 * drift up slower than the content, a gentle parallax that goes on for the whole scroll: shapes leaving
 * at the top come back from the bottom, as the pattern repeats every window height. Without it, and
 * with reduced motion, they stay put. Nothing moves while the screen is still: an endless animation
 * here holds up the screens' layout animations, leaving cards half faded in or out of place.
 */
export function BackdropLayer({ scrollY }: { scrollY?: SharedValue<number> }) {
  const shapes = Backdrop[useColorScheme()];
  const reduceMotion = useReducedMotion();
  const period = useWindowDimensions().height;
  if (shapes.length === 0) return null;
  const moving = reduceMotion ? undefined : scrollY;
  return (
    <View pointerEvents="none" style={styles.layer}>
      {shapes.map((shape, i) =>
        (moving ? COPIES : [0]).map((copy) => (
          <Shape
            key={`${i}:${copy}`}
            shape={shape}
            depth={DEPTHS[i % DEPTHS.length]}
            offset={copy * period}
            period={period}
            scrollY={moving}
          />
        )),
      )}
    </View>
  );
}

type ShapeProps = { shape: BackdropShape; depth: number; offset: number; period: number; scrollY?: SharedValue<number> };

function Shape({ shape, depth, offset, period, scrollY }: ShapeProps) {
  const rotate = `${shape.rotate ?? 0}deg`;
  const drift = useAnimatedStyle(() => {
    // 0 .. period, wrapping, so the copies one period apart take each other's place seamlessly
    const shift = scrollY ? (((scrollY.value * depth) % period) + period) % period : 0;
    return { transform: [{ translateY: offset - shift }, { rotate }] };
  });
  return <Animated.View style={[styles.shape, shape.style, drift]} />;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  shape: { position: 'absolute' },
});
