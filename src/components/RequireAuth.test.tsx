import { render, screen } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/paths';
import { AuthContext, type AuthState } from '@/hooks/useAuth';
import { RequireAuth } from './RequireAuth';

vi.mock('@/services/firebase', () => ({ auth: {}, googleProvider: {} }));

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
  return render(
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
}

describe('RequireAuth', () => {
  it('sends a signed-out visitor to login, remembering where they were going', () => {
    renderAt(PATHS.month, { user: null });
    expect(screen.getByText(`login, voltar para ${PATHS.month}`)).toBeTruthy();
  });

  it('shows the splash while the session is being restored', () => {
    renderAt(PATHS.month, { isLoading: true });
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByText('conteúdo protegido')).toBeNull();
  });

  it('renders the page for a signed-in user', () => {
    renderAt(PATHS.month, { user: { uid: 'owner' } as User });
    expect(screen.getByText('conteúdo protegido')).toBeTruthy();
  });
});
