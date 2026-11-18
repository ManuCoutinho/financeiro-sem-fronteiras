import { AUTH_MESSAGES } from '@/ui/messages';

export function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status">
      <img src="/logo.svg" alt="" className="size-20 animate-pulse rounded-3xl" />
      <span className="sr-only">{AUTH_MESSAGES.loading}</span>
    </div>
  );
}
