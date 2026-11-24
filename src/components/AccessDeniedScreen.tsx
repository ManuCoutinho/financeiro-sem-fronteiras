import { LogOut, RotateCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACCESS_MESSAGES } from '@/ui/messages';

type AccessDeniedScreenProps = {
  email: string | null;
  reason: 'denied' | 'failed';
  onSignOut: () => void;
};

/** Shown instead of the whole app, so an account without access never sees its screens. */
export function AccessDeniedScreen({ email, reason, onSignOut }: AccessDeniedScreenProps) {
  const isDenied = reason === 'denied';

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between gap-10 px-6 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-6 pt-10 text-center">
        <span className="flex size-24 items-center justify-center rounded-[2rem] bg-expense-soft text-expense">
          <ShieldAlert aria-hidden="true" className="size-12" />
        </span>
        <div className="flex flex-col gap-3" role="alert">
          <h1 className="text-3xl leading-tight font-bold tracking-tight">
            {isDenied ? ACCESS_MESSAGES.deniedTitle : ACCESS_MESSAGES.failedTitle}
          </h1>
          {isDenied && email && (
            <p className="text-lg">
              {ACCESS_MESSAGES.signedInAs}
              <strong className="block font-semibold break-all">{email}</strong>
            </p>
          )}
          <p className="text-lg text-muted-foreground">
            {isDenied ? ACCESS_MESSAGES.deniedDescription : ACCESS_MESSAGES.failedDescription}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!isDenied && (
          <Button size="lg" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" /> {ACCESS_MESSAGES.retry}
          </Button>
        )}
        <Button size="lg" variant={isDenied ? 'default' : 'outline'} onClick={onSignOut}>
          <LogOut aria-hidden="true" /> {ACCESS_MESSAGES.switchAccount}
        </Button>
      </div>
    </main>
  );
}
