import { InputAccessoryView, Keyboard, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Give a TextInput `inputAccessoryViewID={KEYBOARD_DONE}` to show a Done button above its keyboard on iOS. */
export const KEYBOARD_DONE = 'keyboard-done';

/**
 * The bar with Done for KEYBOARD_DONE inputs. iOS number pads have no return key, so without it the
 * keyboard of an amount field could only be closed by dragging the screen. Rendered once by Page.
 */
export function KeyboardDoneBar() {
  const theme = useTheme();
  const t = useT();
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE}>
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
