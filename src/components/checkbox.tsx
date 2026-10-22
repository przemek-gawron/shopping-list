import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** Short enough that ticking many items in a row never lags behind the taps. */
const FADE_MS = 80;

type Props = {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

/** Square checkbox: the fill and the tick fade in quickly when checked. */
export function Checkbox({ checked, onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const progress = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: FADE_MS }));
  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', theme.tint]),
  }));
  const tick = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.box, { borderColor: theme.tint }, fill]}>
      <Animated.View style={tick}>
        <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
