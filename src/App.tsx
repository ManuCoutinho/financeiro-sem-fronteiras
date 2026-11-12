import { env } from './config/env';
import { MESSAGES } from './ui/messages';

export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold text-brand">{env.appName}</h1>
      <p className="text-base">{MESSAGES.underConstruction}</p>
    </main>
  );
}
