/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  common: {
    primary: '#004977', // Capital One Blue
    accent: '#D03027',  // Capital One Red
    black: '#000000',
    white: '#FFFFFF',
    textGray: '#666666',
    darkGray: '#333333',
    lightGray: '#E2E8F0',
    placeholder: '#999999',
    gold: '#FFD700',
    gradients: {
      gold: ['#FFD700', '#FDB931'], // Gold to Amber
      darkGold: ['#FFD700', '#B8860B'], // Deep Gold
      premium: ['#1e293b', '#0f172a'], // Slate gradient
    },
  },
  light: {
    text: '#333333',       // Dark Gray
    background: '#F4F5F7', // Light Gray (App Background)
    card: '#FFFFFF',       // White (Card Background)
    action: '#FFFFFF',     // White text on actions
    input: '#FFFFFF',      // White inputs
    border: '#E0E0E0',     // Light Grey Border
    tint: '#004977',       // Capital One Blue
    icon: '#687076',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#004977', // Blue
    success: '#00A859',    // Keep Green for financial success
    error: '#D03027',      // Capital One Red for errors/alerts
    cardText: '#333333',   // Text on cards (Dark on White)
  },
  dark: {
    text: '#ECEDEE',
    background: '#0f172a', // Rich Slate Background
    card: '#1e293b',       // Dark Slate Card (vs Blinding Gold)
    action: '#FFFFFF',
    input: '#1e293b',
    border: '#334155',
    tint: '#FFD700',       // Gold Tint
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: '#FFD700', // Gold
    success: '#00A859',
    error: '#EF4444',      // Brighter Red
    cardText: '#FFFFFF',   // White text on dark cards
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
