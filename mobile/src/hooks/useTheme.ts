import { darkColors, lightColors, shadow } from '../ui/theme';
import { useThemeStore } from '../stores/useThemeStore'; // ✅ Zustand


/* =======================
   THEME HOOK (FIXED)
======================= */
export const useTheme = () => {
  const mode = useThemeStore((s) => s.mode); // 'light' | 'dark'

  const colors = mode === 'dark' ? darkColors : lightColors;

  return {
    mode,
    colors,
    shadow,
  };
};