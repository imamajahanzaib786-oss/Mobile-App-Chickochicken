import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  accessToken: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  hydrated: boolean;
  showAuth: boolean;
  pendingAction: (() => void) | null;

  hydrate: () => Promise<void>;
  openAuth: (pendingAction?: () => void) => void;
  closeAuth: () => void;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = '@auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  showAuth: false,
  pendingAction: null,

  // 🔹 Restore user on app start
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ user: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Auth hydrate failed', e);
    } finally {
      set({ hydrated: true });
    }
  },

  // 🔹 Open auth modal (optionally with pending action)
  openAuth: (pendingAction) => {
    if (pendingAction) {
      set({ pendingAction });
    }
    set({ showAuth: true });
  },

  closeAuth: () => {
    set({ showAuth: false, pendingAction: null });
  },

  // 🔹 Login + run pending action
  login: async (user) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user, showAuth: false });

    const pending = get().pendingAction;
    if (pending) {
      set({ pendingAction: null });
      try {
        pending();
      } catch (e) {
        console.warn('Pending action failed after login', e);
      }
    }
  },

  // 🔹 Logout
  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
