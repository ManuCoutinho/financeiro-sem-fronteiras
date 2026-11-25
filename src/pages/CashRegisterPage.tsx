import { Lock, Plus, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { DaySummaryCard } from '@/components/cashRegister/DaySummaryCard';
import { ItemGrid } from '@/components/cashRegister/ItemGrid';
import { ProductPicker } from '@/components/cashRegister/ProductPicker';
import { TransactionList } from '@/components/cashRegister/TransactionList';
import { UndoDialog } from '@/components/cashRegister/UndoDialog';
import { isReady, LoadState } from '@/components/LoadState';
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
import { CASH_REGISTER_MESSAGES, PAGE_TITLES, SETTINGS_MESSAGES } from '@/ui/messages';

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
  const pickableProducts = products.data
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      priceCents: product.salePriceCents,
      quantity: product.quantity,
      isLow: product.quantity <= product.minStock,
    }));
  const catalog = {
    isLoading: services.isLoading || products.isLoading,
    error: services.error ?? products.error,
  };
  const hasItems = serviceItems.length + pickableProducts.length > 0;

  return (
    <>
      <div className="flex flex-col gap-1">
        <PageHeader title={PAGE_TITLES.cashRegister} />
        <p className="text-base text-muted-foreground first-letter:uppercase">
          {formatBusinessDay(today, CASH_REGISTER_MESSAGES.dayLabelPattern)}
        </p>
      </div>

      <DaySummaryCard summary={summary} isAvailable={isReady(transactions)} />

      {closing.isClosed && (
        <Badge variant="warning" className="self-start text-base">
          <Lock aria-hidden="true" /> {CASH_REGISTER_MESSAGES.dayClosed}
        </Badge>
      )}

      <section aria-labelledby="quick-sale-title" className="flex flex-col gap-3">
        <div>
          <h2 id="quick-sale-title" className="text-2xl font-bold">
            {CASH_REGISTER_MESSAGES.quickSaleTitle}
          </h2>
          {isReady(catalog) && hasItems && !closing.isClosed && (
            <p className="text-sm text-muted-foreground">{CASH_REGISTER_MESSAGES.quickSaleHint}</p>
          )}
        </div>
        <LoadState {...catalog} />
        {isReady(catalog) && !hasItems && (
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
        {isReady(catalog) && (
          <>
            <ItemGrid title={SETTINGS_MESSAGES.servicesTitle} items={serviceItems} isDisabled={closing.isClosed} />
            <ProductPicker products={pickableProducts} isDisabled={closing.isClosed} />
          </>
        )}
      </section>

      <Button asChild variant="outline" size="lg">
        <Link to={PATHS.closing}>
          <Receipt aria-hidden="true" /> {CASH_REGISTER_MESSAGES.closeRegister}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{CASH_REGISTER_MESSAGES.dayListTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadState isLoading={transactions.isLoading} error={transactions.error} />
          {isReady(transactions) && <TransactionList transactions={transactions.data} onUndo={setPendingUndo} />}
        </CardContent>
      </Card>

      {pendingUndo && (
        <UndoDialog transaction={pendingUndo} isDayClosed={closing.isClosed} onClose={() => setPendingUndo(null)} />
      )}
    </>
  );
}
