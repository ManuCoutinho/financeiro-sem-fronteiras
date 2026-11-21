import { ChevronLeft, ChevronRight, Download, Share } from 'lucide-react';
import { useMemo, useState } from 'react';
import { describeTransaction } from '@/components/cashRegister/TransactionList';
import { LoadState } from '@/components/LoadState';
import { DailySalesChart } from '@/components/month/DailySalesChart';
import { KpiGrid, MonthDetailsCard, SalesMixCard, TopItemsCard } from '@/components/month/MonthSummaryCards';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/config/env';
import { shiftMonth, toBusinessMonth } from '@/domain/businessDay';
import { transactionsToCsv } from '@/domain/csv';
import { summarizeMonth } from '@/domain/monthlySummary';
import { useProducts } from '@/hooks/useCatalog';
import { useToday } from '@/hooks/useToday';
import { useMonthlyTransactions } from '@/hooks/useTransactions';
import { canShareFiles, shareOrDownloadTextFile } from '@/lib/download';
import { formatBusinessDay, formatDecimal } from '@/ui/format';
import { CSV_HEADER, MONTH_MESSAGES, PAGE_TITLES, PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from '@/ui/messages';

const TOP_ITEMS_LIMIT = 5;
const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

export function MonthlySummaryPage() {
  const currentMonth = toBusinessMonth(useToday());
  const [month, setMonth] = useState(currentMonth);
  const transactions = useMonthlyTransactions(month);
  const products = useProducts();
  const [isSharing] = useState(canShareFiles);

  const summary = useMemo(
    () =>
      summarizeMonth({
        month,
        transactions: transactions.data,
        products: products.data,
        topItemsLimit: TOP_ITEMS_LIMIT,
      }),
    [month, transactions.data, products.data],
  );

  const exportCsv = () => {
    const rows = transactions.data.map((transaction) => ({
      ...transaction,
      description: describeTransaction(transaction),
    }));
    const csv = transactionsToCsv(rows, {
      delimiter: env.csvDelimiter,
      header: CSV_HEADER,
      formatAmount: formatDecimal,
      typeLabels: TRANSACTION_TYPE_LABELS,
      paymentMethodLabels: PAYMENT_METHOD_LABELS,
    });
    void shareOrDownloadTextFile(MONTH_MESSAGES.fileName(month), csv, CSV_MIME_TYPE);
  };

  const isLoading = transactions.isLoading || products.isLoading;

  return (
    <>
      <PageHeader title={PAGE_TITLES.month} />
      <nav aria-label={PAGE_TITLES.month} className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={MONTH_MESSAGES.previousMonth}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </Button>
        <p aria-live="polite" className="text-lg font-semibold first-letter:uppercase">
          {formatBusinessDay(`${month}-01`, MONTH_MESSAGES.monthPattern)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label={MONTH_MESSAGES.nextMonth}
          disabled={month >= currentMonth}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <ChevronRight aria-hidden="true" className="size-6" />
        </Button>
      </nav>

      <LoadState isLoading={isLoading} error={transactions.error ?? products.error} />

      {!isLoading && (
        <>
          <KpiGrid summary={summary} />
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{MONTH_MESSAGES.dailyTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <DailySalesChart dailyTotals={summary.dailyTotals} />
            </CardContent>
          </Card>
          <SalesMixCard summary={summary} />
          <TopItemsCard items={summary.topItems} />
          <MonthDetailsCard summary={summary} />
          <div className="flex flex-col gap-2">
            <Button size="lg" variant="outline" onClick={exportCsv}>
              {isSharing ? <Share aria-hidden="true" /> : <Download aria-hidden="true" />}{' '}
              {isSharing ? MONTH_MESSAGES.share : MONTH_MESSAGES.export}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isSharing ? MONTH_MESSAGES.shareHint : MONTH_MESSAGES.exportHint}
            </p>
          </div>
        </>
      )}
    </>
  );
}
