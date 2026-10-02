/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Terracotta Kitchen – earthy and warm: terracotta, cream and honey, like a rustic kitchen. Warm-
 * tinted shadows.
 */
export const Colors = {
  light: {
    text: '#3A2A22',
    textSecondary: '#8A7266',
    /** Screen canvas */
    background: '#FBF5EE',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #FBF5EE 0%, #F6E8DA 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#C2552F',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #E07A4F 0%, #B8452A 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#E0A42B',
    destructive: '#B42318',
    icon: '#B9A396',
    border: 'rgba(58, 42, 34, 0.12)',
    borderSubtle: 'rgba(58, 42, 34, 0.07)',
    /** Cards, inputs, sheets */
    cardBackground: '#FFFCF8',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#F3E4D6',
    cardShadow: '0 2px 6px rgba(120, 60, 30, 0.06), 0 10px 28px rgba(120, 60, 30, 0.09)',
    /** Shadow under primary actions */
    tintShadow: '0 8px 18px rgba(184, 69, 42, 0.30)',
  },
  dark: {
    text: '#F6EDE6',
    textSecondary: '#B39C8F',
    background: '#1C1512',
    backgroundGradient: 'linear-gradient(180deg, #1C1512 0%, #150F0C 100%)',
    tint: '#F08A5D',
    tintGradient: 'linear-gradient(135deg, #F59A6B 0%, #D9653B 100%)',
    onPrimary: '#FFFFFF',
    accent: '#F2B544',
    destructive: '#F97066',
    icon: '#7A675C',
    border: 'rgba(246, 237, 230, 0.10)',
    borderSubtle: 'rgba(246, 237, 230, 0.06)',
    cardBackground: '#271D19',
    surfaceCard: '#33261F',
    cardShadow: '0 10px 28px rgba(0, 0, 0, 0.40)',
    tintShadow: '0 8px 20px rgba(217, 101, 59, 0.30)',
  },
};

/** Corner radii. */
export const Radius = {
  card: 18,
  /** Buttons, inputs, segmented control */
  control: 14,
  photo: 14,
};

/** Style of a screen's background: the canvas colour with its gradient. */
export function screenFill(theme: ThemeColors) {
  return { backgroundColor: theme.background, experimental_backgroundImage: theme.backgroundGradient };
}

/** Style of a primary-action fill: the tint gradient (or plain tint) with its shadow. */
export function tintFill(theme: ThemeColors) {
  return { backgroundColor: theme.tint, experimental_backgroundImage: theme.tintGradient, boxShadow: theme.tintShadow };
}

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 640;
/** For screens that lay content out in columns on tablets (recipes, shopping list). */
export const WideContentWidth = 1200;

export type ThemeColors = (typeof Colors)['light'];
