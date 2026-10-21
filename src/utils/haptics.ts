import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * A short tick when a gesture crosses the point where letting go acts (`armed`), and a lighter one
 * when it goes back. Builds without the native module (older ones receiving this over the air) just
 * stay silent.
 */
export function thresholdTick(armed: boolean) {
  const tick =
    Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(armed ? Haptics.AndroidHaptics.Context_Click : Haptics.AndroidHaptics.Clock_Tick)
      : Haptics.impactAsync(armed ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  tick.catch(() => {});
}
