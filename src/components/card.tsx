import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> };

/** Rounded surface; pressable when `onPress` is given. */
export function Card({ children, onPress, style }: Props) {
  const theme = useTheme();
  const base = [styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderSubtle, boxShadow: theme.cardShadow }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.card, borderWidth: 1, padding: 14 },
  pressed: { opacity: 0.7 },
});
