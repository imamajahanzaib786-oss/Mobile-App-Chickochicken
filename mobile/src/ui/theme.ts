import { Platform, ViewStyle, Appearance } from 'react-native';

// Define colors for dark mode
const darkColors = {
  primary: '#FF6B35',
  accent: '#FFD166',
  background: '#0F1724',
  surface: 'rgba(255,255,255,0.06)',
  glass: 'rgba(255,255,255,0.08)',
  text: '#F8FAFC',
  text_btn: '#F8FAFC',
  muted: '#94A3B8',
};

// Define colors for light mode
const lightColors = {
  primary: '#FF6B35',
  accent: '#FFD166',
  background: '#FFFFFF',
  surface: 'rgba(0,0,0,0.05)',
  glass: 'rgba(0,0,0,0.08)',
  text: '#0F1724',
  text_btn: '#F8FAFC',
  muted: '#6B7280',
  
};

// Shadows
const shadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  android: {
    elevation: 6,
  },
  default: {}, // fallback for web
}) as ViewStyle;

// Detect system color scheme
const colorScheme = Appearance.getColorScheme();
const colors = colorScheme === 'dark' ? darkColors : lightColors;

export default { colors, shadow };

// Optional: export both themes if you want to switch manually
export { darkColors, lightColors, shadow };
