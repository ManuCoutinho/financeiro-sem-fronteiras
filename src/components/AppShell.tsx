import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

/** Tab screens: content leaves room for the bottom navigation bar. */
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

/** Flow screens (sale, expense, closing): no bottom bar, with a Back button. */
export function FlowLayout() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <Outlet />
    </main>
  );
}
