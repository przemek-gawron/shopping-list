import type { ViewStyle } from 'react-native';

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
    /** Solid fill of notices floating over content (cards are see-through) */
    toastBackground: '#FFFFFF',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#DCE7E4',
    cardShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 30px rgba(11, 79, 74, 0.10)',
    /** Shadow under primary actions */
    tintShadow: '0 8px 22px rgba(11, 79, 74, 0.35)',
    /** Plan statistics: meals from a recipe, ordered in, without a recipe (checked for colour-blind separation) */
    chartRecipe: '#0F8A6F',
    chartOrdered: '#C46A1C',
    chartNote: '#8B6FD6',
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
    toastBackground: '#17312C',
    surfaceCard: 'rgba(255, 255, 255, 0.08)',
    cardShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 32px rgba(0, 0, 0, 0.45)',
    tintShadow: '0 8px 26px rgba(52, 211, 166, 0.30)',
    chartRecipe: '#22A47E',
    chartOrdered: '#BF7A22',
    chartNote: '#8A72D9',
  },
};

/** Corner radii. */
export const Radius = {
  card: 18,
  /** Buttons, inputs, segmented control */
  control: 12,
  photo: 14,
};

/**
 * Decorative shapes drawn behind every screen (tab screens and pushed / modal pages), fixed while
 * the content scrolls. `style` places and paints the shape (absolute position, size, radius,
 * gradient), `rotate` turns it (degrees).
 */
export type BackdropShape = { style: ViewStyle; rotate?: number };
/** Geometric: a large ring, a circle, a rounded square and a half-pill in see-through emerald, mint and gold. */
export const Backdrop: Record<'light' | 'dark', BackdropShape[]> = {
  light: [
    {
      style: {
        top: -100,
        right: -120,
        width: 320,
        height: 320,
        borderRadius: 160,
        borderWidth: 40,
        borderColor: 'rgba(15, 138, 111, 0.13)',
      },
    },
    {
      style: {
        top: 170,
        left: -80,
        width: 180,
        height: 180,
        borderRadius: 90,
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(52, 211, 166, 0.30) 0%, rgba(11, 79, 74, 0.04) 100%)',
      },
    },
    {
      style: {
        bottom: 150,
        right: -50,
        width: 190,
        height: 190,
        borderRadius: 48,
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(201, 154, 46, 0.24) 0%, rgba(201, 154, 46, 0.03) 100%)',
      },
      rotate: 18,
    },
    {
      style: {
        bottom: -90,
        left: -70,
        width: 280,
        height: 180,
        borderRadius: 140,
        experimental_backgroundImage:
          'linear-gradient(90deg, rgba(15, 138, 111, 0.20) 0%, rgba(52, 211, 166, 0.04) 100%)',
      },
      rotate: -12,
    },
  ],
  dark: [
    {
      style: {
        top: -100,
        right: -120,
        width: 320,
        height: 320,
        borderRadius: 160,
        borderWidth: 40,
        borderColor: 'rgba(52, 211, 166, 0.08)',
      },
    },
    {
      style: {
        top: 170,
        left: -80,
        width: 180,
        height: 180,
        borderRadius: 90,
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(52, 211, 166, 0.22) 0%, rgba(52, 211, 166, 0.02) 100%)',
      },
    },
    {
      style: {
        bottom: 150,
        right: -50,
        width: 190,
        height: 190,
        borderRadius: 48,
        experimental_backgroundImage:
          'linear-gradient(135deg, rgba(233, 196, 106, 0.16) 0%, rgba(233, 196, 106, 0.02) 100%)',
      },
      rotate: 18,
    },
    {
      style: {
        bottom: -90,
        left: -70,
        width: 280,
        height: 180,
        borderRadius: 140,
        experimental_backgroundImage:
          'linear-gradient(90deg, rgba(139, 111, 214, 0.22) 0%, rgba(52, 211, 166, 0.04) 100%)',
      },
      rotate: -12,
    },
  ],
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
