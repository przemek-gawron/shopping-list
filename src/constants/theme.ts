/**
 * The app's look. Every colour, gradient, shadow and corner radius lives here, so a redesign is
 * mostly a matter of changing these values. Gradients and shadows are CSS strings that React
 * Native draws itself (`experimental_backgroundImage`, `boxShadow`); undefined means none.
 */
export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    /** Screen canvas */
    background: '#E8F2ED',
    /** Drawn over `background` behind every screen; should start with the background colour at the top. */
    backgroundGradient: undefined as string | undefined,
    /** Brand colour: links, icons, selected states */
    tint: '#047857',
    /** Fill of primary actions (buttons, add button, selected chips and day); falls back to `tint`. */
    tintGradient: undefined as string | undefined,
    /** Text and icons on `tint` */
    onPrimary: '#FFFFFF',
    accent: '#F59E0B',
    destructive: '#EF4444',
    icon: '#9CA3AF',
    border: 'rgba(4, 120, 87, 0.14)',
    borderSubtle: 'rgba(4, 120, 87, 0.1)',
    /** Cards, inputs, sheets */
    cardBackground: '#F7FCFA',
    /** Quiet fills: stepper buttons, photo placeholders, section headers, progress track */
    surfaceCard: '#DDEDE4',
    cardShadow: undefined as string | undefined,
    /** Shadow under primary actions */
    tintShadow: undefined as string | undefined,
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0F0F0F',
    backgroundGradient: undefined as string | undefined,
    tint: '#10B981',
    tintGradient: undefined as string | undefined,
    onPrimary: '#FFFFFF',
    accent: '#F59E0B',
    destructive: '#F87171',
    icon: '#6B7280',
    border: '#2C2C2E',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    cardBackground: '#1C1C1E',
    surfaceCard: '#202725',
    cardShadow: undefined as string | undefined,
    tintShadow: undefined as string | undefined,
  },
};

/** Corner radii. */
export const Radius = {
  card: 16,
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
