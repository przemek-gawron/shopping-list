import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';

/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Cookbook – warm editorial: cream recipe-card paper, a Fraunces serif for titles, terracotta
 * accent with olive, flat fills and hairline borders instead of glass and glow. Dark mode is an
 * espresso-brown evening version of the same page.
 */
export const Colors = {
  light: {
    text: '#2A211A',
    textSecondary: '#7A6A5C',
    /** Screen canvas */
    background: '#F7F1E6',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #F7F1E6 0%, #F0E6D4 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#B5502C',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: undefined as string | undefined,
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#6B7A3A',
    destructive: '#A8321E',
    icon: '#B3A493',
    border: 'rgba(42, 33, 26, 0.16)',
    borderSubtle: 'rgba(42, 33, 26, 0.08)',
    /** Cards, inputs, sheets */
    cardBackground: '#FFFDF8',
    /** Solid fill of notices floating over content (cards are see-through) */
    toastBackground: '#FFFDF8',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#EFE5D3',
    cardShadow: '0 1px 2px rgba(42, 33, 26, 0.06), 0 6px 18px rgba(42, 33, 26, 0.06)',
    /** Shadow under primary actions */
    tintShadow: '0 4px 12px rgba(181, 80, 44, 0.22)',
    /** Plan statistics: meals from a recipe, ordered in, without a recipe (checked for colour-blind separation) */
    chartRecipe: '#6B7A3A',
    chartOrdered: '#B5502C',
    chartNote: '#7B6BB0',
  },
  dark: {
    text: '#F2E9DC',
    textSecondary: '#A8998A',
    background: '#1A1613',
    backgroundGradient: 'linear-gradient(180deg, #1A1613 0%, #13100D 100%)',
    tint: '#E3845A',
    tintGradient: undefined,
    onPrimary: '#1A1613',
    accent: '#A9B86A',
    destructive: '#F08068',
    icon: '#6A5D51',
    border: 'rgba(242, 233, 220, 0.16)',
    borderSubtle: 'rgba(242, 233, 220, 0.07)',
    cardBackground: '#24201B',
    toastBackground: '#2B2621',
    surfaceCard: '#322C26',
    cardShadow: '0 8px 24px rgba(0, 0, 0, 0.30)',
    tintShadow: '0 4px 14px rgba(227, 132, 90, 0.22)',
    chartRecipe: '#93A35A',
    chartOrdered: '#D9774C',
    chartNote: '#9C8BD3',
  },
};

/** Corner radii. */
export const Radius = {
  card: 14,
  /** Buttons, inputs, segmented control */
  control: 10,
  photo: 10,
  /** Chips and round buttons (add, undo, stepper) */
  pill: 999,
  checkbox: 6,
};

/** Border widths. */
export const Border = {
  card: 1,
  /** Inputs, chips, secondary buttons */
  control: 1,
};

/**
 * Font families by role; undefined means the system font. Every family used here must be in
 * `FontAssets`, which the root layout loads before hiding the splash screen.
 */
export const Fonts: { title?: string; heading?: string; label?: string; button?: string } = {
  title: 'Fraunces_600SemiBold',
  heading: 'Fraunces_600SemiBold',
};
export const FontAssets: Record<string, number> = { Fraunces_600SemiBold };

/** Style for a text role: the family, with the weight reset since custom families carry their own. */
export function font(role: keyof typeof Fonts) {
  const family = Fonts[role];
  return family ? { fontFamily: family, fontWeight: 'normal' as const } : {};
}

/** Image tiled over every screen background (and cards), e.g. paper grain; null for none. */
export const Texture: { light: number | null; dark: number | null; opacity: number } = {
  light: null,
  dark: null,
  opacity: 1,
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
