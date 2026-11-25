import { Boxes, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { buildConfirmSalePath } from '@/app/paths';
import { EditorSheet } from '@/components/EditorSheet';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/ui/format';
import { CASH_REGISTER_MESSAGES, SETTINGS_MESSAGES } from '@/ui/messages';

export type PickableProduct = { id: string; name: string; priceCents: number; quantity: number; isLow: boolean };

// Accents and case do not matter when searching: "cilios" finds "Cílios".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');

type ProductPickerProps = { products: PickableProduct[]; isDisabled: boolean };

/** Products are sold from a searchable stock list instead of one tile each on the cash register. */
export function ProductPicker({ products, isDisabled }: ProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  if (products.length === 0) return null;

  const term = normalize(search.trim());
  const matches = term ? products.filter((product) => normalize(product.name).includes(term)) : products;

  return (
    <>
      <Button variant="outline" size="lg" disabled={isDisabled} onClick={() => setIsOpen(true)}>
        <Boxes aria-hidden="true" /> {CASH_REGISTER_MESSAGES.pickProduct}
      </Button>
      {isOpen && (
        <EditorSheet title={CASH_REGISTER_MESSAGES.productPickerTitle} onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-4">
            <TextField
              label={CASH_REGISTER_MESSAGES.searchProductLabel}
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {matches.length === 0 ? (
              <p className="text-muted-foreground">{CASH_REGISTER_MESSAGES.noProductMatch}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {matches.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={buildConfirmSalePath(product.id)}
                      className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-card p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]"
                    >
                      <span className="flex flex-1 flex-col">
                        <span className="font-semibold">{product.name}</span>
                        <span
                          className={cn(
                            'text-sm',
                            product.isLow ? 'font-semibold text-warning' : 'text-muted-foreground',
                          )}
                        >
                          {SETTINGS_MESSAGES.stockCount(product.quantity)}
                        </span>
                      </span>
                      <span className="text-lg font-bold tabular-nums">{formatCurrency(product.priceCents)}</span>
                      <ChevronRight aria-hidden="true" className="size-5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </EditorSheet>
      )}
    </>
  );
}
