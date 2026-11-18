import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { BACK_LABEL } from '@/ui/messages';

type PageHeaderProps = { title: string; hasBackButton?: boolean; action?: ReactNode };

export function PageHeader({ title, hasBackButton = false, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-2">
      {hasBackButton && (
        <Button variant="ghost" size="icon" aria-label={BACK_LABEL} onClick={() => navigate(-1)}>
          <ChevronLeft aria-hidden="true" className="size-6" />
        </Button>
      )}
      <h1 className="flex-1 text-3xl font-bold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}
