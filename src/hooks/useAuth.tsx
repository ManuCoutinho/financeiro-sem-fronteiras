import {
  browserPopupRedirectResolver,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
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

const PENDING_REDIRECT_KEY = 'fsf:pendingRedirect';
const PENDING_REDIRECT_TTL_MS = 10 * 60 * 1000;

function markPendingRedirect() {
  try {
    localStorage.setItem(PENDING_REDIRECT_KEY, String(Date.now()));
  } catch {
    // Without storage, consumePendingRedirect() falls back to always checking.
  }
}

function clearPendingRedirect() {
  try {
    localStorage.removeItem(PENDING_REDIRECT_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Reads and clears the flag set before leaving for Google. */
function consumePendingRedirect(): boolean {
  try {
    const startedAt = Number(localStorage.getItem(PENDING_REDIRECT_KEY));
    localStorage.removeItem(PENDING_REDIRECT_KEY);
    return startedAt > 0 && Date.now() - startedAt < PENDING_REDIRECT_TTL_MS;
  } catch {
    // Storage is blocked: check every time, as getAuth() would.
    return true;
  }
}

let redirectOutcome: Promise<unknown> | null = null;

/**
 * Finishes a Google redirect sign-in, once per page load. The resolver (and its iframe) is only
 * loaded when the app is coming back from Google. Resolves with the error, if any.
 */
function settlePendingRedirect(): Promise<unknown> {
  redirectOutcome ??= consumePendingRedirect()
    ? getRedirectResult(auth, browserPopupRedirectResolver).then(
        () => null,
        (error: unknown) => error,
      )
    : Promise.resolve(null);
  return redirectOutcome;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let isRedirectSettled = false;
    let isAuthStateKnown = false;
    // Wait for both, so the login screen does not flash while a redirect is still completing.
    const finishLoading = () => {
      if (isActive && isRedirectSettled && isAuthStateKnown) setIsLoading(false);
    };

    void settlePendingRedirect().then((error) => {
      if (!isActive) return;
      if (error) setErrorMessage(toUserMessage(error));
      isRedirectSettled = true;
      finishLoading();
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      isAuthStateKnown = true;
      finishLoading();
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      errorMessage,
      signIn: async () => {
        setErrorMessage(null);
        markPendingRedirect();
        try {
          await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
        } catch (error) {
          clearPendingRedirect();
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
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
