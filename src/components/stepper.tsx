import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
};

/** − value + control. */
export function Stepper({ value, onChange, min = 1, max = 99, step = 1, format }: Props) {
  const theme = useTheme();
  const button = (icon: 'minus' | 'plus', next: number, disabled: boolean, label: string) => (
    <Pressable
      onPress={() => onChange(next)}
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
      <ThemedText type="default" style={styles.value}>
        {format ? format(value) : String(value)}
      </ThemedText>
      {button('plus', Math.min(max, value + step), value >= max, '+')}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  button: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 34, textAlign: 'center', fontWeight: '700' },
});
