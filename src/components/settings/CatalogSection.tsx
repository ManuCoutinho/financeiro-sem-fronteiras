import { ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LOADING_LABEL, SETTINGS_MESSAGES } from '@/ui/messages';

export type CatalogRow = { id: string; name: string; detail: string; isActive: boolean };

type CatalogSectionProps = {
  title: string;
  addLabel: string;
  emptyMessage: string;
  rows: CatalogRow[];
  isLoading: boolean;
  error: string | null;
  onAdd: () => void;
  onSelect: (id: string) => void;
};

function CatalogStatus({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
}: {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
}) {
  if (error) {
    return (
      <p role="alert" className="font-medium text-destructive">
        {error}
      </p>
    );
  }
  if (isLoading)
    return (
      <p role="status" className="text-muted-foreground">
        {LOADING_LABEL}
      </p>
    );
  if (isEmpty) return <p className="text-muted-foreground">{emptyMessage}</p>;
  return null;
}

export function CatalogSection({
  title,
  addLabel,
  emptyMessage,
  rows,
  isLoading,
  error,
  onAdd,
  onSelect,
}: CatalogSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" /> {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CatalogStatus isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyMessage={emptyMessage} />
        {!isLoading && rows.length > 0 && (
          <ul className="-mx-2 flex flex-col">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  className="flex min-h-touch w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="flex flex-1 flex-col">
                    <span className="font-semibold">{row.name}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{row.detail}</span>
                  </span>
                  {!row.isActive && (
                    <Badge variant="voided" className="no-underline">
                      {SETTINGS_MESSAGES.hidden}
                    </Badge>
                  )}
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
