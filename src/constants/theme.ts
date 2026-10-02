/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Sage & Cloud – elevated neutrals: Pantone 2026 "Cloud Dancer" off-white, sage green and wood-tan
 * accents. Calm, soft layered shadows.
 */
export const Colors = {
  light: {
    text: '#2B2A26',
    textSecondary: '#7A776F',
    /** Screen canvas */
    background: '#F0EEE9',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #F0EEE9 0%, #E6E9E1 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#4F6B4A',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #6B8F63 0%, #3F5A3B 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#C89B3C',
    destructive: '#B4533C',
    icon: '#A8A49A',
    border: 'rgba(43, 42, 38, 0.10)',
    borderSubtle: 'rgba(43, 42, 38, 0.06)',
    /** Cards, inputs, sheets */
    cardBackground: '#FBFAF7',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#E7E6DF',
    cardShadow: '0 1px 2px rgba(43, 42, 38, 0.04), 0 8px 24px rgba(43, 42, 38, 0.07)',
    /** Shadow under primary actions */
    tintShadow: '0 6px 16px rgba(63, 90, 59, 0.28)',
  },
  dark: {
    text: '#EDEBE5',
    textSecondary: '#A19E95',
    background: '#1A1B18',
    backgroundGradient: 'linear-gradient(180deg, #1A1B18 0%, #131512 100%)',
    tint: '#9DBF92',
    tintGradient: 'linear-gradient(135deg, #A9C79E 0%, #7FA374 100%)',
    onPrimary: '#16200F',
    accent: '#D9B25F',
    destructive: '#E07A5F',
    icon: '#6E6B63',
    border: 'rgba(237, 235, 229, 0.10)',
    borderSubtle: 'rgba(237, 235, 229, 0.06)',
    cardBackground: '#24261F',
    surfaceCard: '#2E3029',
    cardShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    tintShadow: '0 6px 18px rgba(127, 163, 116, 0.25)',
  },
};

/** Corner radii. */
export const Radius = {
  card: 20,
  /** Buttons, inputs, segmented control */
  control: 14,
  photo: 16,
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
