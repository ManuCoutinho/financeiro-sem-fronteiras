import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlySummary, TopItem } from '@/domain/monthlySummary';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/ui/format';
import { MONTH_MESSAGES, SETTINGS_MESSAGES } from '@/ui/messages';

const PERCENT = 100;

type KpiTileProps = { label: string; cents: number; detail: string; className?: string };

function KpiTile({ label, cents, detail, className }: KpiTileProps) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex flex-col gap-1 px-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('text-2xl font-bold tabular-nums', className)}>{formatCurrency(cents)}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ summary }: { summary: MonthlySummary }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiTile
        label={MONTH_MESSAGES.revenueLabel}
        cents={summary.salesCents}
        detail={MONTH_MESSAGES.saleCount(summary.saleCount)}
      />
      <KpiTile
        label={MONTH_MESSAGES.resultLabel}
        cents={summary.resultCents}
        detail={MONTH_MESSAGES.resultHint}
        className={summary.resultCents < 0 ? 'text-expense' : 'text-income'}
      />
      <KpiTile
        label={MONTH_MESSAGES.averageTicketLabel}
        cents={summary.averageTicketCents}
        detail={MONTH_MESSAGES.averageTicketHint}
      />
      <KpiTile
        label={MONTH_MESSAGES.expensesLabel}
        cents={summary.expensesCents}
        detail={MONTH_MESSAGES.expensesHint}
      />
    </div>
  );
}

function Row({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex flex-col">
        <span>{label}</span>
        {detail && <span className="text-sm text-muted-foreground">{detail}</span>}
      </dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const share = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * PERCENT));

export function SalesMixCard({ summary }: { summary: MonthlySummary }) {
  const total = summary.servicesCents + summary.productsCents;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{MONTH_MESSAGES.mixTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2">
          <Row
            label={SETTINGS_MESSAGES.servicesTitle}
            value={formatCurrency(summary.servicesCents)}
            detail={`${share(summary.servicesCents, total)}%`}
          />
          <Row
            label={SETTINGS_MESSAGES.productsTitle}
            value={formatCurrency(summary.productsCents)}
            detail={`${share(summary.productsCents, total)}%`}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

export function TopItemsCard({ items }: { items: TopItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{MONTH_MESSAGES.topItemsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">{MONTH_MESSAGES.noSales}</p>
        ) : (
          <ol className="flex flex-col divide-y divide-border/20">
            {items.map((item, index) => (
              <li key={`${item.type}:${item.itemId}`} className="flex items-center gap-3 py-2">
                <span className="w-6 text-lg font-bold text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="flex-1 font-semibold">{item.description}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {MONTH_MESSAGES.topItemDetail(item.quantity, formatCurrency(item.revenueCents))}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthDetailsCard({ summary }: { summary: MonthlySummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{MONTH_MESSAGES.detailsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2">
          <Row label={MONTH_MESSAGES.feesLabel} value={formatCurrency(summary.feesCents)} />
          <Row label={MONTH_MESSAGES.netLabel} value={formatCurrency(summary.netCents)} />
          <Row
            label={MONTH_MESSAGES.stockValueLabel}
            value={formatCurrency(summary.stockValueCents)}
            detail={MONTH_MESSAGES.stockValueHint}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
