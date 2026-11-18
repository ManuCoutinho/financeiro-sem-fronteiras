import { getRedirectResult, onAuthStateChanged, signInWithRedirect, signOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth, googleProvider } from '@/services/firebase';
import { toUserMessage } from '@/ui/messages';

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  errorMessage: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // O resultado do redirect só traz erros; o usuário chega pelo onAuthStateChanged.
    getRedirectResult(auth).catch((error: unknown) => setErrorMessage(toUserMessage(error)));

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      errorMessage,
      signIn: async () => {
        setErrorMessage(null);
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (error) {
          setErrorMessage(toUserMessage(error));
        }
      },
      signOut: () => signOut(auth),
    }),
    [user, isLoading, errorMessage],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
}
