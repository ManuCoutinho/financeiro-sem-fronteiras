import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

/**
 * With viewport-fit=cover the clock and battery area is transparent, so scrolled content would
 * show through it. This strip keeps that area the page color.
 */
function StatusBarBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-20 h-[env(safe-area-inset-top)] bg-background"
    />
  );
}

/** Tab screens: content leaves room for the bottom navigation bar. */
export function TabLayout() {
  return (
    <>
      <StatusBarBackdrop />
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[var(--bottom-nav-space)]">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}

/** Flow screens (sale, expense, closing): no bottom bar, with a Back button. */
export function FlowLayout() {
  return (
    <>
      <StatusBarBackdrop />
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </>
  );
}
