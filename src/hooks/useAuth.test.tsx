import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const PENDING_REDIRECT_KEY = 'fsf:pendingRedirect';

const firebaseAuth = vi.hoisted(() => ({
  browserPopupRedirectResolver: { name: 'resolver' },
  getRedirectResult: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => firebaseAuth);
vi.mock('@/services/firebase', () => ({ auth: { currentUser: null }, googleProvider: { id: 'google' } }));

type AuthListener = (user: { uid: string } | null) => void;
let emitAuthState: AuthListener = () => undefined;

async function renderProvider() {
  // The redirect check runs once per page load, so each test needs a fresh module.
  const { AuthProvider, useAuth } = await import('./useAuth');
  let signIn: () => Promise<void> = async () => undefined;
  function Probe() {
    const state = useAuth();
    signIn = state.signIn;
    return (
      <>
        <p>{state.isLoading ? 'loading' : (state.user?.uid ?? 'signed out')}</p>
        {state.errorMessage && <p role="alert">{state.errorMessage}</p>}
      </>
    );
  }
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  return { signIn: () => signIn() };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  localStorage.clear();
  firebaseAuth.onAuthStateChanged.mockImplementation((_auth: unknown, listener: AuthListener) => {
    emitAuthState = listener;
    return () => undefined;
  });
});

afterEach(cleanup);

describe('AuthProvider', () => {
  it('restores the session without loading the redirect resolver on a normal launch', async () => {
    await renderProvider();
    await act(async () => emitAuthState(null));

    expect(screen.getByText('signed out')).toBeTruthy();
    expect(firebaseAuth.getRedirectResult).not.toHaveBeenCalled();
  });

  it('finishes a pending Google redirect before leaving the splash', async () => {
    localStorage.setItem(PENDING_REDIRECT_KEY, String(Date.now()));
    let finishRedirect: () => void = () => undefined;
    firebaseAuth.getRedirectResult.mockReturnValue(new Promise<void>((resolve) => (finishRedirect = resolve)));

    await renderProvider();
    await act(async () => emitAuthState(null));
    expect(screen.getByText('loading')).toBeTruthy();
    expect(firebaseAuth.getRedirectResult).toHaveBeenCalledWith(
      expect.anything(),
      firebaseAuth.browserPopupRedirectResolver,
    );

    await act(async () => {
      emitAuthState({ uid: 'owner' });
      finishRedirect();
    });
    expect(screen.getByText('owner')).toBeTruthy();
    expect(localStorage.getItem(PENDING_REDIRECT_KEY)).toBeNull();
  });

  it('ignores a stale redirect flag', async () => {
    localStorage.setItem(PENDING_REDIRECT_KEY, String(Date.now() - 60 * 60 * 1000));
    await renderProvider();
    await act(async () => emitAuthState(null));

    expect(firebaseAuth.getRedirectResult).not.toHaveBeenCalled();
    expect(screen.getByText('signed out')).toBeTruthy();
  });

  it('flags the redirect and passes the resolver when signing in', async () => {
    firebaseAuth.signInWithRedirect.mockResolvedValue(undefined);
    const { signIn } = await renderProvider();
    await act(() => signIn());

    expect(localStorage.getItem(PENDING_REDIRECT_KEY)).not.toBeNull();
    expect(firebaseAuth.signInWithRedirect).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      firebaseAuth.browserPopupRedirectResolver,
    );
  });

  it('stays on the login screen with a message when there is no connection', async () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    try {
      const { signIn } = await renderProvider();
      await act(async () => emitAuthState(null));
      await act(() => signIn());

      expect(firebaseAuth.signInWithRedirect).not.toHaveBeenCalled();
      expect(localStorage.getItem(PENDING_REDIRECT_KEY)).toBeNull();
      expect(screen.getByRole('alert').textContent).toBe('Sem internet. Conecte-se para entrar pela primeira vez.');
    } finally {
      onLine.mockRestore();
    }
  });

  it('clears the flag when the redirect cannot start', async () => {
    firebaseAuth.signInWithRedirect.mockRejectedValue(new Error('network'));
    const { signIn } = await renderProvider();
    await act(() => signIn());

    expect(localStorage.getItem(PENDING_REDIRECT_KEY)).toBeNull();
  });
});
