import { Platform } from 'react-native';

const primaryLight = '#047857';
const primaryDark = '#10B981';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    background: '#F2F2F7', // iOS-like light gray
    backgroundSecondary: '#FFFFFF',
    tint: primaryLight,
    tintSecondary: '#065F46',
    icon: '#9CA3AF',
    tabIconDefault: '#C7C7CC',
    tabIconSelected: primaryLight,
    border: '#E5E7EB',
    cardBackground: '#FFFFFF',
    success: '#059669',
    error: '#DC2626',
    accent: '#F59E0B', // amber for badges
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
  },
  // Kept for backwards compat (shopping-list header)
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
