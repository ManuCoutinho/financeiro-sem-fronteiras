import { BarChart3, Boxes, Ellipsis, Store, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router';
import { PATHS } from '@/app/paths';
import { cn } from '@/lib/utils';
import { NAVIGATION_ARIA_LABEL, NAVIGATION_LABELS } from '@/ui/messages';

type NavItem = { to: string; label: string; icon: LucideIcon; isEnd?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: PATHS.cashRegister, label: NAVIGATION_LABELS.cashRegister, icon: Store, isEnd: true },
  { to: PATHS.inventory, label: NAVIGATION_LABELS.inventory, icon: Boxes },
  { to: PATHS.month, label: NAVIGATION_LABELS.month, icon: BarChart3 },
  { to: PATHS.settings, label: NAVIGATION_LABELS.more, icon: Ellipsis },
];

export function BottomNav() {
  return (
    <nav
      aria-label={NAVIGATION_ARIA_LABEL}
      className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <ul className="flex w-full items-center justify-between gap-1 rounded-full bg-foreground p-2 shadow-lg">
        {NAV_ITEMS.map(({ to, label, icon: Icon, isEnd }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={isEnd}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch w-full flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-background',
                )
              }
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
