import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, LayoutAnimationConfig } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Motion } from '@/constants/motion';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  /** Makes the number tappable, e.g. to offer more values than the buttons reach. */
  onValuePress?: () => void;
};

/** − value + control. */
export function Stepper({ value, onChange, min = 1, max = 99, step = 1, format, onValuePress }: Props) {
  const theme = useTheme();
  /** Which way the last button moved the value: the new number rolls in from that side. */
  const [direction, setDirection] = useState(1);
  const button = (icon: 'minus' | 'plus', next: number, disabled: boolean, label: string) => (
    <Pressable
      onPress={() => {
        setDirection(next > value ? 1 : -1);
        onChange(next);
      }}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.surfaceCard },
        (pressed || disabled) && { opacity: 0.45 },
      ]}>
      <IconSymbol name={icon} size={16} color={theme.text} />
    </Pressable>
  );

  return (
    <View style={styles.root}>
      {button('minus', Math.max(min, value - step), value <= min, '−')}
      {/* no roll when the stepper first appears, only when the value changes */}
      <LayoutAnimationConfig skipEntering>
        <Animated.View key={value} entering={(direction > 0 ? FadeInUp : FadeInDown).duration(Motion.fast)}>
          <ThemedText
            type="default"
            color={onValuePress ? 'tint' : 'text'}
            style={styles.value}
            onPress={onValuePress}
            accessibilityRole={onValuePress ? 'button' : undefined}>
            {format ? format(value) : String(value)}
          </ThemedText>
        </Animated.View>
      </LayoutAnimationConfig>
      {button('plus', Math.min(max, value + step), value >= max, '+')}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  button: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 40, textAlign: 'center', fontWeight: '700' },
});
