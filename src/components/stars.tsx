import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useT } from '@/i18n';

const MAX = 5;

type Props = {
  value?: number;
  /** Makes the stars tappable; tapping the current rating clears it. */
  onChange?: (value: number | undefined) => void;
  size?: number;
};

/** A 1–5 star rating; read-only without `onChange`. */
export function Stars({ value = 0, onChange, size = 16 }: Props) {
  const t = useT();
  const text = { fontSize: size, lineHeight: size * 1.25 };
  if (!onChange) {
    return (
      <ThemedText color="accent" style={text} accessibilityLabel={t('rating_label', { count: value })}>
        {'★'.repeat(value)}
      </ThemedText>
    );
  }
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={t('rating')}>
      {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => (
        <Pressable
          key={n}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={t('rating_label', { count: n })}
          accessibilityState={{ selected: n <= value }}
          onPress={() => onChange(n === value ? undefined : n)}>
          <ThemedText color={n <= value ? 'accent' : 'icon'} style={text}>
            {n <= value ? '★' : '☆'}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
});
