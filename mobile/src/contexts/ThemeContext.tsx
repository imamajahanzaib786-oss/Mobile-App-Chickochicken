import React, { ReactNode } from 'react';
import  {useThemeStore} from '../stores/useThemeStore';

// Keep a ThemeProvider for compatibility (no-op for zustand), but export
// a `useThemeMode` hook backed by zustand.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export function useThemeMode() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggleMode);
  const setMode = useThemeStore((s) => s.setMode);
  return { mode, toggle, setMode } as const;
}

export default useThemeStore;
