/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Fresh green palette
const primaryLight = '#10B981'; // Emerald green
const primaryDark = '#34D399'; // Lighter emerald for dark mode

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#F0FDF4', // Very light green tint
    backgroundSecondary: '#FFFFFF',
    tint: primaryLight,
    tintSecondary: '#059669', // Darker green for accents
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryLight,
    border: '#D1FAE5',
    cardBackground: '#FFFFFF',
    success: '#10B981',
    error: '#EF4444',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#0F1A14', // Dark with green tint
    backgroundSecondary: '#1A2E23',
    tint: primaryDark,
    tintSecondary: '#6EE7B7',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryDark,
    border: '#1F3D2D',
    cardBackground: '#1A2E23',
    success: '#34D399',
    error: '#F87171',
  },
  // Gradient definitions
  gradients: {
    primary: ['#10B981', '#059669'],
    primaryDark: ['#34D399', '#10B981'],
    header: ['#10B981', '#0D9488'],
    headerDark: ['#1A2E23', '#0F1A14'],
    card: ['#FFFFFF', '#F0FDF4'],
    cardDark: ['#1F3D2D', '#1A2E23'],
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
