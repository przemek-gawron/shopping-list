import { StyleSheet, Text, type TextProps } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'title' | 'heading' | 'default' | 'small' | 'caption' | 'label';
  color?: keyof ThemeColors;
};

export function ThemedText({ style, type = 'default', color, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const fallback = type === 'small' || type === 'caption' || type === 'label' ? 'textSecondary' : 'text';
  return <Text style={[{ color: theme[color ?? fallback] as string }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  default: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
});
