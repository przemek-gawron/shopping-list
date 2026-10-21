import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Motion } from '@/constants/motion';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { checked: boolean; onPress: () => void; accessibilityLabel: string };

/** Square checkbox: the fill fades in and the tick pops in when checked. */
export function Checkbox({ checked, onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const press = usePressScale(0.85);
  const progress = useDerivedValue(() => withTiming(checked ? 1 : 0, { duration: Motion.fast }));
  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', theme.tint]),
  }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.box, { borderColor: theme.tint }, fill, press.style]}>
      {checked && (
        <Animated.View entering={ZoomIn.springify().damping(12)} exiting={ZoomOut.duration(Motion.fast)}>
          <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
