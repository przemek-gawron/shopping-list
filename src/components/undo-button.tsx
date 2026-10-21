import { Pressable, StyleSheet } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Motion } from '@/constants/motion';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Round "undo" button for screen headers; it pops in when there is something to undo. */
export function UndoButton({ onPress, accessibilityLabel }: { onPress: () => void; accessibilityLabel: string }) {
  const theme = useTheme();
  const press = usePressScale(0.88);
  return (
    <AnimatedPressable
      entering={ZoomIn.springify().damping(14)}
      exiting={ZoomOut.duration(Motion.fast)}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, { backgroundColor: theme.surfaceCard }, press.style]}>
      <IconSymbol name="arrow.uturn.backward" size={18} color={theme.tint} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
