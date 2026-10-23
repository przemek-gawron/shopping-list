import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { Border, font, Radius, tintFill } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { label: string; selected?: boolean; onPress?: () => void };

/** Pill used for filters and pickers; always one line, a long label is cut with an ellipsis. */
export function Chip({ label, selected, onPress }: Props) {
  const theme = useTheme();
  const press = usePressScale(0.94);
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.chip,
        selected ? [tintFill(theme), { borderColor: 'transparent', boxShadow: undefined }] : { borderColor: theme.border },
        press.style,
      ]}>
      <Text numberOfLines={1} style={[styles.label, { color: selected ? theme.onPrimary : theme.textSecondary }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: { maxWidth: '100%', borderWidth: Border.control, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  label: { fontSize: 14, fontWeight: '600', ...font('button') },
});
