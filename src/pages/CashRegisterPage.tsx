import { Lock, Plus, Receipt, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { DaySummaryCard } from '@/components/cashRegister/DaySummaryCard';
import { ItemGrid } from '@/components/cashRegister/ItemGrid';
import { TransactionList } from '@/components/cashRegister/TransactionList';
import { UndoDialog } from '@/components/cashRegister/UndoDialog';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { summarizeCashRegister } from '@/domain/cashRegister';
import { useCashClosing } from '@/hooks/useCashClosing';
import { useProducts, useServices } from '@/hooks/useCatalog';
import { useToday } from '@/hooks/useToday';
import { useDailyTransactions } from '@/hooks/useTransactions';
import type { Transaction } from '@/services/transactions';
import { formatBusinessDay } from '@/ui/format';
import { CASH_REGISTER_MESSAGES, LOADING_LABEL, PAGE_TITLES, SETTINGS_MESSAGES } from '@/ui/messages';

function LoadState({ isLoading, error }: { isLoading: boolean; error: string | null }) {
  if (error) {
    return (
      <p role="alert" className="font-medium text-destructive">
        {error}
      </p>
    );
  }
  return isLoading ? (
    <p role="status" className="text-muted-foreground">
      {LOADING_LABEL}
    </p>
  ) : null;
}

export function CashRegisterPage() {
  const today = useToday();
  const services = useServices();
  const products = useProducts();
  const transactions = useDailyTransactions(today);
  const closing = useCashClosing(today);
  const [pendingUndo, setPendingUndo] = useState<Transaction | null>(null);

  const summary = useMemo(() => summarizeCashRegister(transactions.data), [transactions.data]);
  const serviceItems = services.data
    .filter((service) => service.isActive)
    .map((service) => ({ id: service.id, name: service.name, priceCents: service.priceCents }));
  const productItems = products.data
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      priceCents: product.salePriceCents,
      detail: SETTINGS_MESSAGES.stockCount(product.quantity),
      hasWarning: product.quantity <= product.minStock,
    }));
  const isCatalogLoading = services.isLoading || products.isLoading;
  const hasItems = serviceItems.length + productItems.length > 0;

  return (
    <>
      <div className="flex flex-col gap-1">
        <PageHeader title={PAGE_TITLES.cashRegister} />
        <p className="text-base text-muted-foreground first-letter:uppercase">
          {formatBusinessDay(today, CASH_REGISTER_MESSAGES.dayLabelPattern)}
        </p>
      </div>

      <DaySummaryCard summary={summary} />

      {closing.isClosed && (
        <Badge variant="warning" className="self-start text-base">
          <Lock aria-hidden="true" /> {CASH_REGISTER_MESSAGES.dayClosed}
        </Badge>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" size="lg">
          <Link to={PATHS.newExpense}>
            <Wallet aria-hidden="true" /> {PAGE_TITLES.newExpense}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to={PATHS.closing}>
            <Receipt aria-hidden="true" /> {CASH_REGISTER_MESSAGES.closeRegister}
          </Link>
        </Button>
      </div>

      <section aria-labelledby="quick-sale-title" className="flex flex-col gap-3">
        <h2 id="quick-sale-title" className="text-2xl font-bold">
          {CASH_REGISTER_MESSAGES.quickSaleTitle}
        </h2>
        <LoadState isLoading={isCatalogLoading} error={services.error ?? products.error} />
        {!isCatalogLoading && !hasItems && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p>{CASH_REGISTER_MESSAGES.noItems}</p>
              <Button asChild>
                <Link to={PATHS.settings}>
                  <Plus aria-hidden="true" /> {CASH_REGISTER_MESSAGES.goToSettings}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        <ItemGrid title={SETTINGS_MESSAGES.servicesTitle} items={serviceItems} isDisabled={closing.isClosed} />
        <ItemGrid title={SETTINGS_MESSAGES.productsTitle} items={productItems} isDisabled={closing.isClosed} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{CASH_REGISTER_MESSAGES.dayListTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadState isLoading={transactions.isLoading} error={transactions.error} />
          {!transactions.isLoading && <TransactionList transactions={transactions.data} onUndo={setPendingUndo} />}
        </CardContent>
      </Card>

      {pendingUndo && (
        <UndoDialog transaction={pendingUndo} isDayClosed={closing.isClosed} onClose={() => setPendingUndo(null)} />
      )}
    </>
  );
}
