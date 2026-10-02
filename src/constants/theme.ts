/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Lavender Haze – soft-tech pastels ("Soft Gradients 2.0"): periwinkle and lavender fading into
 * mint, airy translucent cards, the roundest shapes.
 */
export const Colors = {
  light: {
    text: '#1E1B2E',
    textSecondary: '#6E6A85',
    /** Screen canvas */
    background: '#F6F4FD',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(170deg, #F6F4FD 0%, #EEF0FF 55%, #E8F6F1 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#6D5BD0',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #8B7CF6 0%, #6D5BD0 55%, #5A8DEE 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#F5A524',
    destructive: '#E5484D',
    icon: '#ABA7C2',
    border: 'rgba(109, 91, 208, 0.16)',
    borderSubtle: 'rgba(109, 91, 208, 0.08)',
    /** Cards, inputs, sheets */
    cardBackground: 'rgba(255, 255, 255, 0.85)',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#ECE9FB',
    cardShadow: '0 8px 30px rgba(109, 91, 208, 0.10)',
    /** Shadow under primary actions */
    tintShadow: '0 10px 24px rgba(109, 91, 208, 0.35)',
  },
  dark: {
    text: '#EEEBFF',
    textSecondary: '#A09CBC',
    background: '#17142A',
    backgroundGradient: 'linear-gradient(170deg, #17142A 0%, #13111F 60%, #0E1A1C 100%)',
    tint: '#A59BFF',
    tintGradient: 'linear-gradient(135deg, #B3A9FF 0%, #8B7CF6 55%, #6FA8FF 100%)',
    onPrimary: '#14102B',
    accent: '#FFC857',
    destructive: '#FF6B81',
    icon: '#6A6688',
    border: 'rgba(165, 155, 255, 0.20)',
    borderSubtle: 'rgba(255, 255, 255, 0.07)',
    cardBackground: '#1D1A2E',
    surfaceCard: '#28243F',
    cardShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
    tintShadow: '0 10px 26px rgba(139, 124, 246, 0.35)',
  },
};

/** Corner radii. */
export const Radius = {
  card: 24,
  /** Buttons, inputs, segmented control */
  control: 16,
  photo: 18,
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
