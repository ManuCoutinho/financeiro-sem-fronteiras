import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { PATHS } from '@/app/paths';
import { useAuth } from '@/hooks/useAuth';
import { SplashScreen } from './SplashScreen';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!user) return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  return children;
}
