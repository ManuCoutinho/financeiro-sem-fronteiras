import { Save } from 'lucide-react';
import { useId, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import {
  EMPTY_IMPORT_PRICING_VALUES,
  evaluateImportPricing,
  type ImportPricingField,
} from '@/components/importPricing/importPricingInput';
import { PageHeader } from '@/components/PageHeader';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useCatalog';
import { notifyError } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { updateProductDetails } from '@/services/catalog';
import { formatCurrency, formatDecimal, formatNumber } from '@/ui/format';
import { IMPORT_PRICING_MESSAGES, PAGE_TITLES } from '@/ui/messages';

const MARGIN_DECIMALS = 10;

function ResultRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt>{label}</dt>
      <dd className={cn('text-xl font-bold tabular-nums', className)}>{value}</dd>
    </div>
  );
}

export function ImportPricingPage() {
  const productFieldId = useId();
  const products = useProducts();
  const [values, setValues] = useState(EMPTY_IMPORT_PRICING_VALUES);
  const [productId, setProductId] = useState('');
  const result = evaluateImportPricing(values);
  const product = products.data.find((candidate) => candidate.id === productId);

  const field = (name: ImportPricingField) => ({
    value: values[name],
    error: result.errors[name],
    autoComplete: 'off',
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValues({ ...values, [name]: event.target.value }),
  });

  const selectProduct = (id: string) => {
    setProductId(id);
    const selected = products.data.find((candidate) => candidate.id === id);
    if (selected) setValues({ ...values, salePrice: formatDecimal(selected.salePriceCents) });
  };

  const saveCost = () => {
    if (!product || result.unitCostCents === null) return;
    const { name, salePriceCents, minStock, expiresOn, isActive, sortOrder } = product;
    updateProductDetails(
      product.id,
      { name, salePriceCents, costCents: result.unitCostCents, minStock, expiresOn, isActive, sortOrder },
      notifyError,
    );
    toast.success(IMPORT_PRICING_MESSAGES.costSaved);
  };

  const marginPercent = result.marginPercent;
  const isLoss = (result.profitCents ?? 0) < 0;

  return (
    <>
      <PageHeader title={PAGE_TITLES.importPricing} hasBackButton />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{IMPORT_PRICING_MESSAGES.purchaseTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <TextField
            label={IMPORT_PRICING_MESSAGES.foreignAmountLabel}
            hint={IMPORT_PRICING_MESSAGES.foreignAmountHint}
            inputMode="decimal"
            {...field('foreignAmount')}
          />
          <TextField
            label={IMPORT_PRICING_MESSAGES.exchangeRateLabel}
            hint={IMPORT_PRICING_MESSAGES.exchangeRateHint}
            inputMode="decimal"
            {...field('exchangeRate')}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={IMPORT_PRICING_MESSAGES.shippingLabel}
              inputMode="decimal"
              className="flex flex-col justify-end gap-2"
              {...field('shipping')}
            />
            <TextField
              label={IMPORT_PRICING_MESSAGES.taxesLabel}
              inputMode="decimal"
              className="flex flex-col justify-end gap-2"
              {...field('taxes')}
            />
          </div>
          <TextField label={IMPORT_PRICING_MESSAGES.quantityLabel} inputMode="numeric" {...field('quantity')} />
        </CardContent>
      </Card>

      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-xl">{IMPORT_PRICING_MESSAGES.costTitle}</CardTitle>
        </CardHeader>
        <CardContent aria-live="polite">
          {result.unitCostCents === null || result.totalCostCents === null ? (
            <p>{IMPORT_PRICING_MESSAGES.fillPurchase}</p>
          ) : (
            <dl className="flex flex-col gap-2">
              <ResultRow label={IMPORT_PRICING_MESSAGES.unitCostLabel} value={formatCurrency(result.unitCostCents)} />
              <ResultRow label={IMPORT_PRICING_MESSAGES.totalCostLabel} value={formatCurrency(result.totalCostCents)} />
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{IMPORT_PRICING_MESSAGES.priceTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {products.data.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor={productFieldId} className="text-base">
                {IMPORT_PRICING_MESSAGES.productLabel}
              </Label>
              <select
                id={productFieldId}
                value={productId}
                onChange={(event) => selectProduct(event.target.value)}
                aria-describedby={`${productFieldId}-hint`}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-base focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <option value="">{IMPORT_PRICING_MESSAGES.noProduct}</option>
                {products.data.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
              <p id={`${productFieldId}-hint`} className="text-sm text-muted-foreground">
                {IMPORT_PRICING_MESSAGES.productHint}
              </p>
            </div>
          )}
          <TextField label={IMPORT_PRICING_MESSAGES.salePriceLabel} inputMode="decimal" {...field('salePrice')} />

          <div aria-live="polite">
            {marginPercent === null || result.profitCents === null ? (
              <p className="text-muted-foreground">{IMPORT_PRICING_MESSAGES.fillPrice}</p>
            ) : (
              <div className="flex flex-col gap-2">
                <dl className="flex flex-col gap-2">
                  <ResultRow
                    label={IMPORT_PRICING_MESSAGES.marginLabel}
                    value={`${formatNumber(Math.round(marginPercent * MARGIN_DECIMALS) / MARGIN_DECIMALS)}%`}
                    className={isLoss ? 'text-expense' : 'text-income'}
                  />
                  <ResultRow
                    label={IMPORT_PRICING_MESSAGES.profitLabel}
                    value={formatCurrency(result.profitCents)}
                    className={isLoss ? 'text-expense' : 'text-income'}
                  />
                </dl>
                <p className="text-sm text-muted-foreground">{IMPORT_PRICING_MESSAGES.marginHint}</p>
              </div>
            )}
          </div>

          {product && result.unitCostCents !== null && (
            <Button size="lg" variant="outline" onClick={saveCost}>
              <Save aria-hidden="true" /> {IMPORT_PRICING_MESSAGES.saveCost}
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
