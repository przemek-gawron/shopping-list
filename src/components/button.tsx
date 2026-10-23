import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { Border, font, Radius, tintFill } from '@/constants/theme';
import { usePressScale } from '@/hooks/use-press-scale';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const theme = useTheme();
  const press = usePressScale();
  const background = variant === 'destructive' ? 'transparent' : theme.surfaceCard;
  const color =
    variant === 'primary' ? theme.onPrimary : variant === 'destructive' ? theme.destructive : theme.text;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.button,
        variant === 'primary'
          ? [tintFill(theme), { borderColor: 'transparent' }]
          : { backgroundColor: background, borderColor: variant === 'destructive' ? theme.destructive : background },
        disabled && styles.dim,
        press.style,
      ]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radius.control,
    borderWidth: Border.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: { fontSize: 16, fontWeight: '700', ...font('button') },
  dim: { opacity: 0.6 },
});
