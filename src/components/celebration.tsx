import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PIECES = ['🎉', '🥕', '✨', '🛒', '🍋', '✨', '🥑', '🎉', '🍅', '✨'];
const DURATION = 1100;

/**
 * A short burst of emoji rising from the middle of its parent, played once when mounted.
 * Skipped when the system asks for reduced motion. The parent should be `position: relative`.
 */
export function Celebration() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={styles.root}>
      {PIECES.map((emoji, i) => (
        <Piece key={i} emoji={emoji} index={i} />
      ))}
    </View>
  );
}

function Piece({ emoji, index }: { emoji: string; index: number }) {
  const progress = useSharedValue(0);
  // spread the pieces over a fan, alternating sides, the outer ones lower
  const side = index % 2 === 0 ? -1 : 1;
  const spread = (Math.floor(index / 2) + 1) * 28 * side;
  const rise = 70 + ((index * 37) % 50);
  const spin = (index % 3) - 1;

  useEffect(() => {
    progress.set(withDelay(index * 35, withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) })));
  }, [progress, index]);

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3,
      transform: [
        { translateX: spread * p },
        // up, then falling back a little
        { translateY: -rise * p + 40 * p * p },
        { rotate: `${spin * 200 * p}deg` },
        { scale: 0.4 + 0.8 * Math.min(1, p * 3) },
      ],
    };
  });

  return <Animated.Text style={[styles.piece, style]}>{emoji}</Animated.Text>;
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  piece: { position: 'absolute', fontSize: 22 },
});
