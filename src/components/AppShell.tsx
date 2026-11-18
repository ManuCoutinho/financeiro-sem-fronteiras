import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

/** Telas das abas: conteúdo com espaço para a barra inferior. */
export function TabLayout() {
  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}

/** Telas de fluxo (venda, despesa, fechamento): sem barra, com botão Voltar. */
export function FlowLayout() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Outlet />
    </main>
  );
}
