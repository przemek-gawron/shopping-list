import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Radius, tintFill } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { onPress: () => void; accessibilityLabel: string };

/** Round "+" button for screen headers. The plus is drawn, since a "+" glyph never sits centred. */
export function AddButton({ onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  const press = usePressScale(0.88);
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, tintFill(theme), press.style]}>
      <View style={[styles.horizontal, { backgroundColor: theme.onPrimary }]} />
      <View style={[styles.vertical, { backgroundColor: theme.onPrimary }]} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  horizontal: { position: 'absolute', width: 16, height: 2.5, borderRadius: 1.25 },
  vertical: { position: 'absolute', width: 2.5, height: 16, borderRadius: 1.25 },
});
