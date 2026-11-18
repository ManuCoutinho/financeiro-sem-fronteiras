import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { PATHS } from '@/app/paths';
import { SplashScreen } from '@/components/SplashScreen';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_MESSAGES } from '@/ui/messages';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function LoginPage() {
  const { user, isLoading, errorMessage, signIn } = useAuth();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isLoading) return <SplashScreen />;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? PATHS.cashRegister;
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async () => {
    setIsRedirecting(true);
    await signIn();
    setIsRedirecting(false);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between gap-10 px-6 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-6 pt-10 text-center">
        <img src="/logo.svg" alt="" className="size-36 rounded-[2.5rem] shadow-[0_16px_40px_-16px_rgb(0_24_88/0.35)]" />
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-tight font-bold tracking-tight">{env.appName}</h1>
          <p className="text-lg text-muted-foreground">{AUTH_MESSAGES.tagline}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {errorMessage && (
          <p role="alert" className="rounded-2xl bg-expense-soft px-4 py-3 text-center text-expense">
            {errorMessage}
          </p>
        )}
        <Button size="lg" onClick={handleSignIn} disabled={isRedirecting}>
          <span className="flex size-8 items-center justify-center rounded-full bg-card">
            <GoogleMark />
          </span>
          {isRedirecting ? AUTH_MESSAGES.signingIn : AUTH_MESSAGES.signInWithGoogle}
        </Button>
      </div>
    </main>
  );
}
