import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 15, stiffness: 420, mass: 0.5 };

/**
 * Shrinks a pressable a little while it is held and springs it back on release, so a tap is felt
 * even before the screen changes. Spread the handlers on the pressable and add `style` to it.
 */
export function usePressScale(to = 0.96) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return {
    style,
    onPressIn: () => {
      scale.set(withSpring(to, SPRING));
    },
    onPressOut: () => {
      scale.set(withSpring(1, SPRING));
    },
  };
}
