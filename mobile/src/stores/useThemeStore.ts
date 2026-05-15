import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // default mode
      setMode: (mode: ThemeMode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'app-theme', // key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
