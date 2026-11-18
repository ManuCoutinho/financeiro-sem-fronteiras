import {
  BarChart3,
  Boxes,
  Check,
  CloudUpload,
  Ellipsis,
  Minus,
  Plus,
  Store,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { NAVIGATION_LABELS, PAYMENT_METHOD_LABELS, STOCK_ALERT_LABELS } from '@/ui/messages';
import { formatCurrency } from '@/ui/format';

/*
 * Página temporária para aprovar a identidade visual (etapa 1.3 do plano).
 * Sai do app quando as telas reais entrarem.
 */

const PALETTE = [
  { name: 'Fundo', hex: '#fef6e4' },
  { name: 'Títulos', hex: '#001858' },
  { name: 'Texto', hex: '#172c66' },
  { name: 'Destaque', hex: '#f582ae' },
  { name: 'Pêssego', hex: '#f3d2c1' },
  { name: 'Azul-claro', hex: '#8bd3dd' },
];

const STATE_COLORS = [
  { name: 'Entrada', className: 'bg-income' },
  { name: 'Despesa', className: 'bg-expense' },
  { name: 'Alerta', className: 'bg-warning' },
  { name: 'Desfeito', className: 'bg-voided' },
];

const SAMPLE_ITEMS = [
  { name: 'Design + henna', priceCents: 6000, kind: 'service' },
  { name: 'Design simples', priceCents: 4000, kind: 'service' },
  { name: 'Brow lamination', priceCents: 12000, kind: 'service' },
  { name: 'Sérum de crescimento', priceCents: 8900, kind: 'product' },
] as const;

const SAMPLE_ENTRIES = [
  { description: 'Design + henna', method: 'pix', cents: 6000, state: 'income' },
  { description: 'Sérum de crescimento', method: 'credit', cents: 8900, state: 'pending' },
  { description: 'Algodão e lâminas', method: 'cash', cents: -3500, state: 'expense' },
  { description: 'Design simples', method: 'debit', cents: 4000, state: 'voided' },
] as const;

const NAV_ITEMS = [
  { label: NAVIGATION_LABELS.cashRegister, icon: Store },
  { label: NAVIGATION_LABELS.inventory, icon: Boxes },
  { label: NAVIGATION_LABELS.month, icon: BarChart3 },
  { label: NAVIGATION_LABELS.more, icon: Ellipsis },
];

function SectionTitle({ children }: { children: string }) {
  return <h2 className="px-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{children}</h2>;
}

export function DesignPreviewPage() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-4 pt-6 pb-32">
      <Toaster />

      <header className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="size-14 rounded-2xl shadow-sm" />
        <div>
          <p className="text-sm text-muted-foreground">Amostra de design</p>
          <h1 className="text-2xl leading-tight font-bold">Financeiro sem Fronteiras</h1>
        </div>
      </header>

      <section className="flex flex-col gap-3" aria-labelledby="logo-title">
        <SectionTitle>Logo e ícone do app</SectionTitle>
        <Card>
          <CardContent className="flex items-end justify-around gap-4">
            <figure className="flex flex-col items-center gap-2">
              <img src="/icon-512.png" alt="Ícone do app em tamanho grande" className="size-28 rounded-[1.75rem]" />
              <figcaption className="text-sm text-muted-foreground">Tela de início</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <img
                src="/icon-maskable-512.png"
                alt="Ícone do app recortado em círculo"
                className="size-20 rounded-full"
              />
              <figcaption className="text-sm text-muted-foreground">Android</figcaption>
            </figure>
            <figure className="flex flex-col items-center gap-2">
              <img src="/favicon.svg" alt="Ícone do app em tamanho pequeno" className="size-8" />
              <figcaption className="text-sm text-muted-foreground">Aba</figcaption>
            </figure>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Paleta</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {PALETTE.map((color) => (
            <div key={color.hex} className="flex flex-col gap-1.5 rounded-2xl bg-card p-2 shadow-sm">
              <span className="h-12 rounded-xl ring-1 ring-foreground/15" style={{ backgroundColor: color.hex }} />
              <span className="px-1 text-sm font-semibold">{color.name}</span>
              <span className="px-1 text-xs text-muted-foreground tabular-nums">{color.hex}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {STATE_COLORS.map((color) => (
            <div key={color.name} className="flex flex-col items-center gap-1.5">
              <span className={cn('size-10 rounded-full', color.className)} />
              <span className="text-sm">{color.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Esboço da tela Caixa</SectionTitle>

        <Card className="bg-primary">
          <CardHeader>
            <CardDescription className="text-primary-foreground">Hoje, terça 17/11</CardDescription>
            <CardTitle className="text-sm font-medium">Entrou no caixa</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-5xl font-bold tracking-tight tabular-nums">{formatCurrency(18900)}</p>
            <Badge className="bg-card text-foreground">4 vendas</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="rounded-3xl">
            <Wallet aria-hidden="true" /> Gastei
          </Button>
          <Button variant="outline" size="lg" className="rounded-3xl">
            <Check aria-hidden="true" /> Fechar o caixa
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SAMPLE_ITEMS.map((item) => (
            <button
              key={item.name}
              type="button"
              className={cn(
                'flex min-h-24 flex-col items-start justify-between gap-2 rounded-3xl p-4 text-left shadow-sm transition active:scale-[0.97]',
                item.kind === 'service' ? 'bg-card' : 'bg-secondary',
              )}
            >
              <span className="text-base leading-tight font-semibold">{item.name}</span>
              <span className="text-lg font-bold tabular-nums">{formatCurrency(item.priceCents)}</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lançamentos de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {SAMPLE_ENTRIES.map((entry) => (
                <li key={entry.description} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={cn('font-semibold', entry.state === 'voided' && 'text-voided line-through')}>
                      {entry.description}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[entry.method]}
                      {entry.state === 'pending' && (
                        <Badge variant="warning">
                          <CloudUpload aria-hidden="true" /> Aguardando envio
                        </Badge>
                      )}
                      {entry.state === 'voided' && <Badge variant="voided">Desfeito</Badge>}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      entry.state === 'expense' && 'text-expense',
                      entry.state === 'income' && 'text-income',
                      entry.state === 'pending' && 'text-income',
                      entry.state === 'voided' && 'text-voided line-through',
                    )}
                  >
                    {formatCurrency(entry.cents)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Confirmar venda</SectionTitle>
        <Card>
          <CardHeader>
            <CardDescription>Produto</CardDescription>
            <CardTitle className="text-xl">Sérum de crescimento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Quantidade</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Diminuir quantidade"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus aria-hidden="true" />
                </Button>
                <span className="w-8 text-center text-2xl font-bold tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Aumentar quantidade"
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="discount">Desconto (opcional)</Label>
              <Input id="discount" inputMode="decimal" placeholder="R$ 0,00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                <Button
                  key={method}
                  size="lg"
                  className="rounded-3xl"
                  onClick={() =>
                    toast.success('Venda registrada', { action: { label: 'Desfazer', onClick: () => {} } })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Alertas de estoque</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="expense">
            <TriangleAlert aria-hidden="true" /> {STOCK_ALERT_LABELS.negative}
          </Badge>
          <Badge variant="warning">
            <TriangleAlert aria-hidden="true" /> {STOCK_ALERT_LABELS.low}
          </Badge>
          <Badge variant="warning">{STOCK_ALERT_LABELS.expiringSoon}</Badge>
          <Badge variant="expense">{STOCK_ALERT_LABELS.expired}</Badge>
          <Badge variant="income">Entrada de 10</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Botões</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Discreto</Button>
        </div>
      </section>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <ul className="flex w-full items-center justify-between gap-1 rounded-full bg-foreground p-2 shadow-lg">
          {NAV_ITEMS.map(({ label, icon: Icon }, index) => {
            const isActive = index === activeTab;
            return (
              <li key={label} className="flex-1">
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    'flex min-h-touch w-full flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-background',
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
