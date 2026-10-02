import { Pressable, StyleSheet, Text } from 'react-native';

import { tintFill } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; selected?: boolean; onPress?: () => void };

/** Pill used for filters and pickers. */
export function Chip({ label, selected, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? [tintFill(theme), { borderColor: 'transparent', boxShadow: undefined }] : { borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color: selected ? theme.onPrimary : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  label: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
