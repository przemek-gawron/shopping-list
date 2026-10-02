/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Citrus Pop – bold and appetising: a tangerine → coral → raspberry gradient on clean white cards,
 * rounder shapes. Energetic, food-app feel.
 */
export const Colors = {
  light: {
    text: '#1F1A24',
    textSecondary: '#7C7385',
    /** Screen canvas */
    background: '#FFF7F2',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #FFF7F2 0%, #FFEEF2 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#F2542D',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #FF8A3D 0%, #F2542D 50%, #E8336B 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#FFB020',
    destructive: '#D92D20',
    icon: '#B6AEBD',
    border: 'rgba(242, 84, 45, 0.18)',
    borderSubtle: 'rgba(31, 26, 36, 0.06)',
    /** Cards, inputs, sheets */
    cardBackground: '#FFFFFF',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#FFE9DF',
    cardShadow: '0 1px 3px rgba(31, 26, 36, 0.06), 0 6px 18px rgba(242, 84, 45, 0.09)',
    /** Shadow under primary actions */
    tintShadow: '0 10px 22px rgba(232, 51, 107, 0.32)',
  },
  dark: {
    text: '#F7F3FA',
    textSecondary: '#A69CB0',
    background: '#14111A',
    backgroundGradient: 'linear-gradient(180deg, #14111A 0%, #1C1221 100%)',
    tint: '#FF7A45',
    tintGradient: 'linear-gradient(135deg, #FF9A4D 0%, #FF5A36 50%, #F0447A 100%)',
    onPrimary: '#FFFFFF',
    accent: '#FFC145',
    destructive: '#FF6B6B',
    icon: '#6F6579',
    border: 'rgba(255, 122, 69, 0.24)',
    borderSubtle: 'rgba(255, 255, 255, 0.07)',
    cardBackground: '#1F1A26',
    surfaceCard: '#2A2232',
    cardShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
    tintShadow: '0 10px 24px rgba(240, 68, 122, 0.35)',
  },
};

/** Corner radii. */
export const Radius = {
  card: 22,
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
