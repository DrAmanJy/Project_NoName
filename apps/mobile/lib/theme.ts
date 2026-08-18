import { useColorScheme } from 'react-native';

export const lightColors = {
  background: '#F7F7F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111111',
  textSecondary: '#666666',
  textMuted: '#888888',
  border: '#eaeaea',
  primary: '#111111',
  primaryText: '#FFFFFF',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  overlay: 'rgba(0,0,0,0.5)',
  iconBg: '#F0F0F0',
};

export const darkColors = {
  // Main screen background
  background: '#0F1115',

  // Secondary sections / inputs / surfaces
  surface: '#171A20',

  // Cards that need to stand out from the background
  card: '#1C2027',

  // Primary text
  text: '#F5F5F5',

  // Secondary text
  textSecondary: '#A1A1AA',

  // Muted / disabled text
  textMuted: '#71717A',

  // Dividers and borders
  border: '#2A2E36',

  // Primary action
  primary: '#FFFFFF',

  // Text on primary button
  primaryText: '#111111',

  // Semantic colors
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Modal/background overlay
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Icon containers
  iconBg: '#242830',
};
const defaultFonts = {
  regular: { fontFamily: '', fontWeight: 'normal' },
  medium: { fontFamily: '', fontWeight: 'normal' },
  bold: { fontFamily: '', fontWeight: 'normal' },
  heavy: { fontFamily: '', fontWeight: 'normal' },
};

export const navigationLightTheme: any = {
  dark: false,
  colors: {
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.card,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.danger,
  },
  fonts: defaultFonts,
};

export const navigationDarkTheme: any = {
  dark: true,
  colors: {
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.card,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.danger,
  },
  fonts: defaultFonts,
};

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
