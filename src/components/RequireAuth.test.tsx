import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/paths';
import { AuthContext, type AuthState } from '@/hooks/useAuth';
import { ACCESS_CHECK_TIMEOUT_MS } from '@/hooks/useOwnerAccess';
import { rememberVerifiedOwner } from '@/lib/verifiedOwner';
import type { OwnerAccessListener } from '@/services/access';
import { RequireAuth } from './RequireAuth';

vi.mock('@/services/firebase', () => ({ auth: {}, googleProvider: {} }));

const access = vi.hoisted(() => ({ listener: null as OwnerAccessListener | null, unsubscribe: vi.fn() }));
vi.mock('@/services/access', () => ({
  watchOwnerAccess: (listener: OwnerAccessListener) => {
    access.listener = listener;
    return access.unsubscribe;
  },
}));

const owner = { uid: 'owner', email: 'dona@exemplo.com' } as User;
const stranger = { uid: 'stranger', email: 'outra@exemplo.com' } as User;

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <p>login, voltar para {from}</p>;
}

function renderAt(path: string, state: Partial<AuthState>) {
  const value: AuthState = {
    user: null,
    isLoading: false,
    errorMessage: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...state,
  };
  render(
    <AuthContext value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={PATHS.login} element={<LoginProbe />} />
          <Route
            path={PATHS.month}
            element={
              <RequireAuth>
                <p>conteúdo protegido</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext>,
  );
  return value;
}

async function answerAccess(answer: keyof OwnerAccessListener) {
  await vi.waitFor(() => expect(access.listener).not.toBeNull());
  act(() => access.listener?.[answer]());
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    access.listener = null;
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('sends a signed-out visitor to login, remembering where they were going', () => {
    renderAt(PATHS.month, { user: null });
    expect(screen.getByText(`login, voltar para ${PATHS.month}`)).toBeTruthy();
  });

  it('shows the splash while the session is being restored', () => {
    renderAt(PATHS.month, { isLoading: true });
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();
  });

  it('keeps the app hidden until the server confirms the owner', async () => {
    renderAt(PATHS.month, { user: owner });
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();

    await answerAccess('onAllowed');
    expect(screen.getByText('conteúdo protegido')).toBeTruthy();
  });

  it('shows only the access screen to an account that is not the owner', async () => {
    const auth = renderAt(PATHS.month, { user: stranger });
    await answerAccess('onDenied');

    expect(screen.getByRole('heading', { name: 'Esta conta não tem acesso' })).toBeTruthy();
    expect(screen.getByText('outra@exemplo.com')).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Sair e entrar com outra conta' }));
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('opens right away, even offline, for the owner confirmed on this device', () => {
    rememberVerifiedOwner('owner');
    renderAt(PATHS.month, { user: owner });
    expect(screen.getByText('conteúdo protegido')).toBeTruthy();
  });

  it('does not trust the confirmation of another account on this device', () => {
    rememberVerifiedOwner('owner');
    renderAt(PATHS.month, { user: stranger });
    expect(screen.queryByText('conteúdo protegido')).toBeNull();
  });

  it('closes the app when a confirmed owner loses access', async () => {
    rememberVerifiedOwner('owner');
    renderAt(PATHS.month, { user: owner });
    await answerAccess('onDenied');

    expect(screen.queryByText('conteúdo protegido')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Esta conta não tem acesso' })).toBeTruthy();
    expect(localStorage.length).toBe(0);
  });

  it('offers to try again when access cannot be checked', async () => {
    renderAt(PATHS.month, { user: stranger });
    await answerAccess('onFailed');

    expect(screen.getByRole('heading', { name: 'Não deu para confirmar o acesso' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();
  });

  it('stops waiting on the splash when the server never answers, and recovers if it does', async () => {
    vi.useFakeTimers();
    try {
      renderAt(PATHS.month, { user: owner });
      await vi.waitFor(() => expect(access.listener).not.toBeNull());
      expect(screen.getByRole('status')).toBeTruthy();

      act(() => vi.advanceTimersByTime(ACCESS_CHECK_TIMEOUT_MS));
      expect(screen.getByRole('heading', { name: 'Não deu para confirmar o acesso' })).toBeTruthy();

      act(() => access.listener?.onAllowed());
      expect(screen.getByText('conteúdo protegido')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps a confirmed owner in the app through a transient error', async () => {
    rememberVerifiedOwner('owner');
    renderAt(PATHS.month, { user: owner });
    await answerAccess('onFailed');
    expect(screen.getByText('conteúdo protegido')).toBeTruthy();
  });
});
