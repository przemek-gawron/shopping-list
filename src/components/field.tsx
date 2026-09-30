import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & { label?: string };

export function Field({ label, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? <ThemedText type="label">{label}</ThemedText> : null}
      <TextInput
        placeholderTextColor={theme.icon}
        {...rest}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border },
          rest.multiline && styles.multiline,
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
});
