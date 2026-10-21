import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = { onPress: () => void; accessibilityLabel: string };

/** 🎲 that rolls over once each time it is pressed, for drawing a random recipe in place. */
export function DiceButton({ onPress, accessibilityLabel }: Props) {
  const turns = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turns.get() * 360}deg` }, { scale: 1 + 0.25 * Math.sin((turns.get() % 1) * Math.PI) }],
  }));
  return (
    <Pressable
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        turns.set(withSpring(Math.round(turns.get()) + 1, { damping: 14, stiffness: 120 }));
        onPress();
      }}>
      <Animated.Text style={[styles.dice, style]}>🎲</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dice: { fontSize: 16, lineHeight: 20 },
});
