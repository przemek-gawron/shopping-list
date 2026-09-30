import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const theme = useTheme();
  const background =
    variant === 'primary' ? theme.tint : variant === 'destructive' ? 'transparent' : theme.surfaceCard;
  const color =
    variant === 'primary' ? theme.onPrimary : variant === 'destructive' ? theme.destructive : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, borderColor: variant === 'destructive' ? theme.destructive : background },
        (pressed || disabled) && styles.dim,
      ]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: { fontSize: 16, fontWeight: '700' },
  dim: { opacity: 0.6 },
});
