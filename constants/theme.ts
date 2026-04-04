import { Platform } from 'react-native';

const primaryLight = '#047857';
const primaryDark = '#10B981';

/**
 * Light mode: soft green-tinted canvas, glass-like elevated surfaces, semantic tokens for overlays.
 * Dark mode: keep existing character; tokens mirror structure for type-safe access.
 */
export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    /** Main screen canvas — soft mint (replaces flat iOS gray) */
    background: '#E8F2ED',
    backgroundSecondary: '#F0F9F5',
    tint: primaryLight,
    tintSecondary: '#065F46',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryLight,
    border: 'rgba(4, 120, 87, 0.14)',
    /** Cards, sheets — not pure white */
    cardBackground: '#F7FCFA',
    success: '#059669',
    error: '#DC2626',
    accent: '#F59E0B',

    surfacePrimary: '#E8F2ED',
    surfaceElevated: '#F7FCFA',
    /** Frosted list rows / chips */
    surfaceGlass: 'rgba(255, 255, 255, 0.82)',
    surfaceOverlay: 'rgba(4, 120, 87, 0.45)',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255, 255, 255, 0.75)',
    borderSubtle: 'rgba(4, 120, 87, 0.1)',
    shadowColor: 'rgba(6, 95, 70, 0.16)',
    tabBarBackground: '#F4FBF8',
    backdropTint: '#E8F2ED',
    headerGradientStart: '#047857',
    headerGradientEnd: '#0A5C47',
    overlayOnPrimary: 'rgba(255, 255, 255, 0.26)',
    overlayOnPrimarySubtle: 'rgba(255, 255, 255, 0.17)',
    /** Solid nav / modal header (matches gradient start) */
    headerChrome: '#047857',
    headerBackgroundDark: '#064E3B',
    destructive: '#EF4444',
    modalOverlay: 'rgba(15, 23, 42, 0.48)',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0F0F0F',
    backgroundSecondary: '#1C1C1E',
    tint: primaryDark,
    tintSecondary: '#34D399',
    icon: '#6B7280',
    tabIconDefault: '#48484A',
    tabIconSelected: primaryDark,
    border: '#2C2C2E',
    cardBackground: '#1C1C1E',
    success: '#10B981',
    error: '#F87171',
    accent: '#F59E0B',

    surfacePrimary: '#0F0F0F',
    surfaceElevated: '#1C1C1E',
    surfaceGlass: 'rgba(28, 28, 30, 0.88)',
    surfaceOverlay: 'rgba(16, 185, 129, 0.35)',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    tabBarBackground: '#141414',
    backdropTint: '#0F0F0F',
    headerGradientStart: '#064E3B',
    headerGradientEnd: '#052E24',
    overlayOnPrimary: 'rgba(255, 255, 255, 0.22)',
    overlayOnPrimarySubtle: 'rgba(255, 255, 255, 0.12)',
    headerChrome: '#064E3B',
    headerBackgroundDark: '#064E3B',
    destructive: '#F87171',
    modalOverlay: 'rgba(0, 0, 0, 0.62)',
  },
  gradients: {
    primary: ['#047857', '#065F46'],
    primaryDark: ['#10B981', '#059669'],
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
