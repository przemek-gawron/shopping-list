import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Motion } from '@/constants/motion';
import { Spacing } from '@/constants/theme';

export function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <Animated.View entering={FadeIn.duration(Motion.normal * 2)} style={styles.root}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="heading" style={styles.center}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="small" style={styles.center}>
          {subtitle}
        </ThemedText>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.three },
  emoji: { fontSize: 44, lineHeight: 54 },
  center: { textAlign: 'center' },
});
