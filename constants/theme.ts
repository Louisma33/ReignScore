/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  common: {
    gold: '#FFD700', // Classic bright gold
    black: '#000000',
    white: '#FFFFFF',
    textGray: '#888888',
  },
  light: {
    text: '#11181C',       // Dark Slate
    background: '#F8F9FA', // Porcelain / Off-White (Standard Fintech Light)
    card: '#FFFFFF',       // Pure White Cards
    action: '#FFFFFF',     // Action text (on buttons)
    input: '#FFFFFF',      // White inputs
    border: '#E2E8F0',     // Light Slate Border
    tint: '#B8860B',       // Dark Goldenrod (Metallic Gold) - readable on white
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#B8860B',
    success: '#15803D',    // Deep Green
    error: '#DC2626',      // Deep Red
  },
  dark: {
    text: '#ECEDEE',
    background: '#09090B', // Rich Black (Zinc-950)
    card: '#18181B',       // Zinc-900 Cards
    action: '#000000',
    input: '#18181B',
    border: '#27272A',
    tint: '#FFD700',       // Bright Gold
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFD700',
    success: '#4ADE80',    // Bright Neon Green
    error: '#EF4444',      // Bright Red
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
