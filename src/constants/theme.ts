import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';

/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Fresh Pop – bold and playful: chunky rounded cards on an off-white canvas, Bricolage Grotesque
 * headlines, a tomato → raspberry gradient for actions with a violet accent, soft lifted shadows
 * and no hairlines. Dark mode is near-black with the same punchy colours.
 */
export const Colors = {
  light: {
    text: '#141414',
    textSecondary: '#6B6B66',
    /** Screen canvas */
    background: '#F4F4EE',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #F4F4EE 0%, #EEEEE6 100%)',
    /** Brand colour: links, icons, selected states */
    tint: '#F2453D',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: 'linear-gradient(135deg, #FF7A45 0%, #F23D5E 100%)',
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#7A5CFA',
    destructive: '#D92638',
    icon: '#A3A39D',
    border: 'rgba(20, 20, 20, 0.10)',
    borderSubtle: 'rgba(20, 20, 20, 0.03)',
    /** Cards, inputs, sheets */
    cardBackground: '#FFFFFF',
    /** Solid fill of notices floating over content (cards are see-through) */
    toastBackground: '#FFFFFF',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#ECECE4',
    cardShadow: '0 1px 0 rgba(20, 20, 20, 0.03), 0 12px 28px rgba(20, 20, 20, 0.07)',
    /** Shadow under primary actions */
    tintShadow: '0 10px 22px rgba(242, 61, 94, 0.32)',
    /** Plan statistics: meals from a recipe, ordered in, without a recipe (checked for colour-blind separation) */
    chartRecipe: '#1FA971',
    chartOrdered: '#FF6B35',
    chartNote: '#7A5CFA',
  },
  dark: {
    text: '#F5F5F0',
    textSecondary: '#9B9B96',
    background: '#0F0F10',
    backgroundGradient: 'linear-gradient(180deg, #0F0F10 0%, #0B0B0C 100%)',
    tint: '#FF6A4D',
    tintGradient: 'linear-gradient(135deg, #FF8A5B 0%, #FF4D6D 100%)',
    onPrimary: '#FFFFFF',
    accent: '#B9A6FF',
    destructive: '#FF6B7A',
    icon: '#5E5E5A',
    border: 'rgba(255, 255, 255, 0.10)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    cardBackground: '#1C1C1E',
    toastBackground: '#26262A',
    surfaceCard: '#2A2A2E',
    cardShadow: '0 12px 28px rgba(0, 0, 0, 0.40)',
    tintShadow: '0 10px 26px rgba(255, 77, 109, 0.32)',
    chartRecipe: '#2FC487',
    chartOrdered: '#FF7A45',
    chartNote: '#9C86FF',
  },
};

/** Corner radii. */
export const Radius = {
  card: 26,
  /** Buttons, inputs, segmented control */
  control: 16,
  photo: 20,
  /** Chips and round buttons (add, undo, stepper) */
  pill: 999,
  checkbox: 8,
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
  title: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_700Bold',
  label: 'BricolageGrotesque_700Bold',
  button: 'BricolageGrotesque_700Bold',
};
export const FontAssets: Record<string, number> = { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold };

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
