import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { PATHS } from '@/app/paths';
import { QuantityStepper } from '@/components/cashRegister/QuantityStepper';
import { PageHeader } from '@/components/PageHeader';
import { MoneyField } from '@/components/MoneyField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SaleType } from '@/domain/cashRegister';
import { PAYMENT_METHODS, type PaymentMethod } from '@/domain/money';
import { previewSale } from '@/domain/sale';
import { useCashClosing } from '@/hooks/useCashClosing';
import { useBusinessSettings, useProducts, useServices } from '@/hooks/useCatalog';
import { useToday } from '@/hooks/useToday';
import { notifyError, notifyRejected } from '@/lib/notify';
import { registerSale, voidTransaction, whenSavedOnDevice } from '@/services/transactions';
import { formatCurrency, formatNumber, parseAmountToCents } from '@/ui/format';
import {
  FORM_MESSAGES,
  LOADING_LABEL,
  MESSAGES,
  PAGE_TITLES,
  PAYMENT_METHOD_LABELS,
  SALE_MESSAGES,
  STOCK_ALERT_LABELS,
} from '@/ui/messages';

const UNDO_TOAST_DURATION_MS = 8000;

type SaleItem = { type: SaleType; id: string; name: string; unitPriceCents: number; stockQuantity: number | null };

function useSaleItem(itemId: string) {
  const services = useServices();
  const products = useProducts();
  const service = services.data.find((item) => item.id === itemId && item.isActive);
  const product = products.data.find((item) => item.id === itemId && item.isActive);

  const item: SaleItem | null = service
    ? { type: 'service', id: service.id, name: service.name, unitPriceCents: service.priceCents, stockQuantity: null }
    : product
      ? {
          type: 'product',
          id: product.id,
          name: product.name,
          unitPriceCents: product.salePriceCents,
          stockQuantity: product.quantity,
        }
      : null;

  return { item, isLoading: services.isLoading || products.isLoading };
}

function parseDiscount(text: string): number | null {
  return text.trim() === '' ? 0 : parseAmountToCents(text);
}

function Notice({ children }: { children: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <p role="status">{children}</p>
        <Button asChild variant="outline">
          <Link to={PATHS.cashRegister}>{SALE_MESSAGES.backToRegister}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ConfirmSalePage() {
  const { itemId = '' } = useParams();
  const navigate = useNavigate();
  const today = useToday();
  const { item, isLoading } = useSaleItem(itemId);
  const settings = useBusinessSettings();
  const closing = useCashClosing(today);
  const [quantity, setQuantity] = useState(1);
  const [discountText, setDiscountText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const header = <PageHeader title={PAGE_TITLES.confirmSale} hasBackButton />;
  if (isLoading || closing.isLoading) {
    return (
      <>
        {header}
        <p role="status" className="text-muted-foreground">
          {LOADING_LABEL}
        </p>
      </>
    );
  }
  if (!item)
    return (
      <>
        {header}
        <Notice>{SALE_MESSAGES.itemNotFound}</Notice>
      </>
    );
  if (closing.isClosed)
    return (
      <>
        {header}
        <Notice>{SALE_MESSAGES.dayClosed}</Notice>
      </>
    );

  const parsedDiscount = parseDiscount(discountText);
  const discountCents = parsedDiscount ?? 0;
  const preview = previewSale({
    unitPriceCents: item.unitPriceCents,
    quantity,
    discountCents,
    stockQuantity: item.stockQuantity,
  });
  const discountError =
    parsedDiscount === null
      ? FORM_MESSAGES.invalidAmount
      : preview.isDiscountValid
        ? undefined
        : SALE_MESSAGES.discountTooHigh;

  const register = async (paymentMethod: PaymentMethod) => {
    setIsSaving(true);
    const sale = {
      type: item.type,
      itemId: item.id,
      description: item.name,
      quantity,
      unitPriceCents: item.unitPriceCents,
      discountCents,
      paymentMethod,
      feePercent: settings.data.feePercentByMethod[paymentMethod],
      day: today,
    };
    const transactionId = registerSale(sale, notifyRejected(SALE_MESSAGES.notRegistered));
    try {
      // Saying "registered" before the sale is stored is what let it vanish from the day list.
      await whenSavedOnDevice(transactionId);
    } catch {
      setIsSaving(false);
      toast.error(SALE_MESSAGES.notSavedOnDevice);
      return;
    }
    const undo = () => {
      const result = voidTransaction({ id: transactionId, ...sale }, closing.data, notifyError);
      if (result === 'dayClosed') toast.error(MESSAGES.dayClosedReopenFirst);
      else toast.success(SALE_MESSAGES.saleVoided);
    };
    toast.success(MESSAGES.saleRegistered, {
      description: navigator.onLine ? undefined : MESSAGES.offlineSaleSaved,
      action: { label: MESSAGES.undo, onClick: undo },
      duration: UNDO_TOAST_DURATION_MS,
    });
    navigate(PATHS.cashRegister);
  };

  return (
    <>
      {header}

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{item.name}</span>
            <span className="text-base text-muted-foreground tabular-nums">{formatCurrency(item.unitPriceCents)}</span>
          </div>
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <MoneyField
            label={SALE_MESSAGES.discountLabel}
            value={discountText}
            onChange={(event) => setDiscountText(event.target.value)}
            error={discountError}
          />
          <div className="flex items-baseline justify-between border-t border-border/20 pt-4">
            <span className="text-lg font-semibold">{SALE_MESSAGES.totalLabel}</span>
            <span className="text-3xl font-bold tabular-nums" aria-live="polite">
              {formatCurrency(preview.totalCents)}
            </span>
          </div>
          {preview.needsStockCheck && preview.remainingStock !== null && (
            <div role="alert" className="flex gap-2 rounded-xl bg-warning-soft p-3 text-warning">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p>
                <strong className="block">{STOCK_ALERT_LABELS.negative}</strong>
                {SALE_MESSAGES.stockCheck(preview.remainingStock)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="payment-title" className="flex flex-col gap-3">
        <div>
          <h2 id="payment-title" className="text-xl font-bold">
            {SALE_MESSAGES.paymentTitle}
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isSaving ? SALE_MESSAGES.saving : SALE_MESSAGES.paymentHint}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const feePercent = settings.data.feePercentByMethod[method];
            return (
              <Button
                key={method}
                size="lg"
                className="h-auto min-h-16 flex-col gap-0 py-2"
                disabled={discountError !== undefined || isSaving}
                onClick={() => void register(method)}
              >
                <span className="text-lg">{PAYMENT_METHOD_LABELS[method]}</span>
                {feePercent > 0 && (
                  <span className="text-sm font-medium">{SALE_MESSAGES.feeHint(formatNumber(feePercent))}</span>
                )}
              </Button>
            );
          })}
        </div>
      </section>
    </>
  );
}
