/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Deep green palette
const primaryLight = '#047857'; // Deep emerald
const primaryDark = '#10B981'; // Emerald for dark mode

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#4B5563',
    background: '#F3F4F6', // Light gray
    backgroundSecondary: '#FFFFFF',
    tint: primaryLight,
    tintSecondary: '#065F46', // Even darker green
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryLight,
    border: '#E5E7EB',
    cardBackground: '#FFFFFF',
    success: '#059669',
    error: '#DC2626',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    tint: primaryDark,
    tintSecondary: '#34D399',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryDark,
    border: '#374151',
    cardBackground: '#1F2937',
    success: '#10B981',
    error: '#F87171',
  },
  // Gradient definitions
  gradients: {
    primary: ['#047857', '#065F46'],
    primaryDark: ['#10B981', '#059669'],
    header: ['#047857', '#0F766E'],
    headerDark: ['#1F2937', '#111827'],
    card: ['#FFFFFF', '#F9FAFB'],
    cardDark: ['#374151', '#1F2937'],
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
