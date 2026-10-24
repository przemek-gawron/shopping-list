import { InputAccessoryView, Keyboard, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/**
 * A bar with Done above the iOS keyboard of the input whose `inputAccessoryViewID` is `nativeID`.
 * iOS number pads have no return key, so without it the keyboard of an amount field could only be
 * closed by dragging the screen. Render it right after its input with an id of its own: on the new
 * architecture the bar attaches to the first matching input when it mounts, so a shared id only
 * ever reaches one field.
 */
export function KeyboardDoneBar({ nativeID }: { nativeID: string }) {
  const theme = useTheme();
  const t = useT();
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.bar}>
        <ThemedText
          color="tint"
          accessibilityRole="button"
          onPress={Keyboard.dismiss}
          style={[styles.done, { backgroundColor: theme.toastBackground, borderColor: theme.borderSubtle }]}>
          {t('keyboard_done')}
        </ThemedText>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  done: {
    fontWeight: '700',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
