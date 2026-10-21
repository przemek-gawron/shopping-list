import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Motion } from '@/constants/motion';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** The plain variant fades quickly, so ticking many meals in a row never lags behind the taps. */
const PLAIN_MS = 100;

type Props = {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  /** false: the fill and tick only fade in, quickly, without the pop and the press shrink. */
  pop?: boolean;
};

/** Square checkbox: the fill fades in and the tick pops in when checked. */
export function Checkbox({ checked, onPress, accessibilityLabel, pop = true }: Props) {
  const theme = useTheme();
  const press = usePressScale(0.85);
  const progress = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: pop ? Motion.fast : PLAIN_MS }));
  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', theme.tint]),
  }));
  const tick = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={pop ? press.onPressIn : undefined}
      onPressOut={pop ? press.onPressOut : undefined}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.box, { borderColor: theme.tint }, fill, pop && press.style]}>
      {pop ? (
        checked && (
          <Animated.View entering={ZoomIn.springify().damping(12)} exiting={ZoomOut.duration(Motion.fast)}>
            <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />
          </Animated.View>
        )
      ) : (
        <Animated.View style={tick}>
          <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
