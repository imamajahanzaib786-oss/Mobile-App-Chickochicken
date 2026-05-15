import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

type User = { accessToken: string; name: string; email: string } | null;

type AuthContextValue = {
  user: User;
  showAuth: boolean;
  openAuth: (pendingAction?: () => void) => void;
  closeAuth: () => void;
  handleAuthSuccess: (accessToken: string, name: string, email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [showAuth, setShowAuth] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  function openAuth(pendingAction?: () => void) {
    if (pendingAction) pendingRef.current = pendingAction;
    setShowAuth(true);
  }

  function closeAuth() {
    setShowAuth(false);
    pendingRef.current = null;
  }

  function handleAuthSuccess(accessToken: string, name: string, email: string) {
    setUser({ accessToken, name, email });
    setShowAuth(false);
    try {
      if (pendingRef.current) {
        const fn = pendingRef.current;
        pendingRef.current = null;
        fn();
      }
    } catch (e) {
      console.warn('Pending action failed after auth', e);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, showAuth, openAuth, closeAuth, handleAuthSuccess, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
