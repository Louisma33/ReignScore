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
    background: '#151718',
    card: '#FFD700',       // Gold (Card Background)
    action: '#000000',
    input: '#252525',
    border: '#333333',
    tint: '#FFD700',       // Gold tint? Or keep Blue? Let's try Gold for consistency
    icon: '#4A4A4A',       // Darker icons for Gold backgrounds if used there?
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFD700', // Gold
    success: '#00A859',
    error: '#D03027',      // Red
    cardText: '#1A1A1A',   // Text on cards (Dark on Gold)
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
