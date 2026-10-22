import { Platform } from 'react-native';
import { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

/**
 * Shared animation timings. Layout animations follow the system "reduce motion" setting
 * (Reanimated's default), so nothing here needs its own check.
 */
export const Motion = {
  fast: 160,
  /** Content revealed on request (a group opened): short enough to never be waited for. */
  reveal: 200,
  normal: 240,
};

/** A row appearing in a list (an item added, a checked item moving to its new section). */
export const rowEnter = FadeIn.duration(Motion.normal);
/** A row leaving a list (deleted, checked off, moved to another section). */
export const rowExit = FadeOut.duration(Motion.fast);
/**
 * Siblings sliding into the space a row left or made. iOS only: on Android the transition stops a few
 * pixels short and leaves a gap where a row was deleted, so rows there take their place at once.
 */
export const rowLayout = Platform.OS === 'ios' ? LinearTransition.duration(Motion.normal) : undefined;

/** Recipe cards shown by opening a group, a filter or a search, all at once rather than one by one. */
export const revealEnter = FadeIn.duration(Motion.reveal);
export const revealLayout = Platform.OS === 'ios' ? LinearTransition.duration(Motion.reveal) : undefined;
