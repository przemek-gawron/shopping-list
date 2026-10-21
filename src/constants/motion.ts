import { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

/**
 * Shared animation timings. Layout animations follow the system "reduce motion" setting
 * (Reanimated's default), so nothing here needs its own check.
 */
export const Motion = {
  fast: 160,
  normal: 240,
};

/** A row appearing in a list (an item added, a checked item moving to its new section). */
export const rowEnter = FadeIn.duration(Motion.normal);
/** A row leaving a list (deleted, checked off, moved to another section). */
export const rowExit = FadeOut.duration(Motion.fast);
/** Siblings sliding into the space a row left or made. */
export const rowLayout = LinearTransition.duration(Motion.normal);
