import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.root}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="heading" style={styles.center}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="small" style={styles.center}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.three },
  emoji: { fontSize: 44, lineHeight: 54 },
  center: { textAlign: 'center' },
});
