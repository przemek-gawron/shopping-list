/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Midnight Emerald – refined jewel tones: deep emerald with gold, dark mode first with frosted-
 * glass cards over an emerald → amethyst glow.
 */
export const Colors = {
  light: {
    text: '#0E1F1C',
    textSecondary: '#5C6F6B',
    /** Screen canvas */
    background: '#EEF3F1',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #EEF3F1 0%, #E1EBE8 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#0B6E5A',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #0F8A6F 0%, #0B4F4A 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#C99A2E',
    destructive: '#C2410C',
    icon: '#98A8A4',
    border: 'rgba(11, 79, 74, 0.14)',
    borderSubtle: 'rgba(11, 79, 74, 0.08)',
    /** Cards, inputs, sheets */
    cardBackground: 'rgba(255, 255, 255, 0.78)',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#DCE7E4',
    cardShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 30px rgba(11, 79, 74, 0.10)',
    /** Shadow under primary actions */
    tintShadow: '0 8px 22px rgba(11, 79, 74, 0.35)',
  },
  dark: {
    text: '#E8F5F1',
    textSecondary: '#8FA9A3',
    background: '#0B1F1C',
    backgroundGradient: 'linear-gradient(165deg, #0B1F1C 0%, #081412 45%, #150F24 100%)',
    tint: '#34D3A6',
    tintGradient: 'linear-gradient(135deg, #3BE0B0 0%, #15A68A 100%)',
    onPrimary: '#04211B',
    accent: '#E9C46A',
    destructive: '#FB7185',
    icon: '#55706A',
    border: 'rgba(52, 211, 166, 0.18)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    surfaceCard: 'rgba(255, 255, 255, 0.08)',
    cardShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 32px rgba(0, 0, 0, 0.45)',
    tintShadow: '0 8px 26px rgba(52, 211, 166, 0.30)',
  },
};

/** Corner radii. */
export const Radius = {
  card: 18,
  /** Buttons, inputs, segmented control */
  control: 12,
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
