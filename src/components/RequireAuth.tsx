import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { PATHS } from '@/app/paths';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerAccess } from '@/hooks/useOwnerAccess';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { SplashScreen } from './SplashScreen';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const access = useOwnerAccess(user?.uid ?? null);
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!user) return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  if (access === 'checking') return <SplashScreen />;
  if (access === 'allowed') return children;
  return <AccessDeniedScreen email={user.email} reason={access} onSignOut={() => void signOut()} />;
}
