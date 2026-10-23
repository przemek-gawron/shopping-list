import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono/700Bold';

/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 *
 * Raw Kraft – tactile brutalism: recycled-paper grain under everything, ink-black 2 px outlines,
 * hard offset shadows instead of blur, square corners, a signal-orange accent and monospaced labels,
 * like a printed market list. Dark mode is the same sheet in charcoal with chalk lines.
 */
export const Colors = {
  light: {
    text: '#16130F',
    textSecondary: '#5E554A',
    /** Screen canvas */
    background: '#E9E1CF',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: 'linear-gradient(180deg, #E9E1CF 0%, #E2D7BF 100%)' as string | undefined,
    /** Brand colour: links, icons, selected states */
    tint: '#D9381A',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: undefined as string | undefined,
    /** Text and icons on `tint` */
    onPrimary: '#FFF8EC',
    accent: '#E8B21E',
    destructive: '#A32418',
    icon: '#8A7F70',
    border: '#16130F',
    borderSubtle: '#16130F',
    /** Cards, inputs, sheets */
    cardBackground: 'rgba(252, 248, 239, 0.86)',
    /** Solid fill of notices floating over content (cards are see-through) */
    toastBackground: '#FCF8EF',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#D8CDB4',
    cardShadow: '4px 4px 0 #16130F',
    /** Shadow under primary actions */
    tintShadow: '3px 3px 0 #16130F',
    /** Plan statistics: meals from a recipe, ordered in, without a recipe (checked for colour-blind separation) */
    chartRecipe: '#2F6B4F',
    chartOrdered: '#D9381A',
    chartNote: '#3E5C9A',
  },
  dark: {
    text: '#F1E9D8',
    textSecondary: '#A99E8A',
    background: '#1C1A16',
    backgroundGradient: 'linear-gradient(180deg, #1C1A16 0%, #15130F 100%)',
    tint: '#FF6A3D',
    tintGradient: undefined,
    onPrimary: '#16130F',
    accent: '#F2C230',
    destructive: '#FF7466',
    icon: '#6E665A',
    border: '#E6DCC6',
    borderSubtle: 'rgba(230, 220, 198, 0.8)',
    cardBackground: 'rgba(40, 37, 31, 0.88)',
    toastBackground: '#28251F',
    surfaceCard: '#35302A',
    cardShadow: '4px 4px 0 #000000',
    tintShadow: '3px 3px 0 #000000',
    chartRecipe: '#4FA57B',
    chartOrdered: '#FF6A3D',
    chartNote: '#7D97D6',
  },
};

/** Corner radii. */
export const Radius = {
  card: 4,
  /** Buttons, inputs, segmented control */
  control: 3,
  photo: 2,
  /** Chips and round buttons (add, undo, stepper) */
  pill: 3,
  checkbox: 2,
};

/** Border widths. */
export const Border = {
  card: 2,
  /** Inputs, chips, secondary buttons */
  control: 2,
};

/**
 * Font families by role; undefined means the system font. Every family used here must be in
 * `FontAssets`, which the root layout loads before hiding the splash screen.
 */
export const Fonts: { title?: string; heading?: string; label?: string; button?: string } = {
  title: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_700Bold',
  label: 'SpaceMono_700Bold',
  button: 'SpaceMono_700Bold',
};
export const FontAssets: Record<string, number> = { SpaceGrotesk_700Bold, SpaceMono_700Bold };

/** Style for a text role: the family, with the weight reset since custom families carry their own. */
export function font(role: keyof typeof Fonts) {
  const family = Fonts[role];
  return family ? { fontFamily: family, fontWeight: 'normal' as const } : {};
}

/** Image tiled over every screen background (and cards), e.g. paper grain; null for none. */
export const Texture: { light: number | null; dark: number | null; opacity: number } = {
  light: require('../../assets/textures/paper-light.png'),
  dark: require('../../assets/textures/paper-dark.png'),
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
