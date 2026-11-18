import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CheckboxField } from '@/components/CheckboxField';
import { EditorSheet } from '@/components/EditorSheet';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import type { Product } from '@/domain/schemas';
import { notifyError } from '@/lib/notify';
import { createProduct, updateProductDetails } from '@/services/catalog';
import { SETTINGS_MESSAGES } from '@/ui/messages';
import { productFormSchema, toProductFormValues, type ProductFormValues } from './settingsForms';

type ProductSheetProps = { product: Product | null; nextSortOrder: number; onClose: () => void };

export function ProductSheet({ product, nextSortOrder, onClose }: ProductSheetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, z.output<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toProductFormValues(product),
  });

  const onSubmit = handleSubmit(({ name, salePrice, cost, quantity, minStock, expiresOn, isActive }) => {
    const details = {
      name,
      salePriceCents: salePrice,
      costCents: cost,
      minStock,
      expiresOn,
      isActive,
      sortOrder: product?.sortOrder ?? nextSortOrder,
    };
    if (product) updateProductDetails(product.id, details, notifyError);
    else createProduct({ ...details, quantity }, notifyError);
    toast.success(SETTINGS_MESSAGES.productSaved);
    onClose();
  });

  return (
    <EditorSheet title={product ? SETTINGS_MESSAGES.editProduct : SETTINGS_MESSAGES.addProduct} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label={SETTINGS_MESSAGES.nameLabel}
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={SETTINGS_MESSAGES.salePriceLabel}
            inputMode="decimal"
            autoComplete="off"
            error={errors.salePrice?.message}
            className="flex flex-col justify-end gap-2"
            {...register('salePrice')}
          />
          <TextField
            label={SETTINGS_MESSAGES.costLabel}
            inputMode="decimal"
            autoComplete="off"
            error={errors.cost?.message}
            className="flex flex-col justify-end gap-2"
            {...register('cost')}
          />
        </div>
        <p className="-mt-3 text-sm text-muted-foreground">{SETTINGS_MESSAGES.costHint}</p>
        {product ? (
          <div className="flex flex-col gap-1 rounded-xl bg-muted p-3">
            <p className="font-semibold tabular-nums">{SETTINGS_MESSAGES.currentStock(product.quantity)}</p>
            <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.stockChangeHint}</p>
          </div>
        ) : (
          <TextField
            label={SETTINGS_MESSAGES.quantityLabel}
            inputMode="numeric"
            autoComplete="off"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
        )}
        <TextField
          label={SETTINGS_MESSAGES.minStockLabel}
          hint={SETTINGS_MESSAGES.minStockHint}
          inputMode="numeric"
          autoComplete="off"
          error={errors.minStock?.message}
          {...register('minStock')}
        />
        <TextField
          label={SETTINGS_MESSAGES.expiresOnLabel}
          type="date"
          error={errors.expiresOn?.message}
          {...register('expiresOn')}
        />
        <CheckboxField
          label={SETTINGS_MESSAGES.isActiveLabel}
          hint={SETTINGS_MESSAGES.isActiveHint}
          {...register('isActive')}
        />
        <Button type="submit" size="lg">
          {SETTINGS_MESSAGES.save}
        </Button>
      </form>
    </EditorSheet>
  );
}
