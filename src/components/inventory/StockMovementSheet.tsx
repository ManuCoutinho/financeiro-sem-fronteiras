import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { EditorSheet } from '@/components/EditorSheet';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import { ADJUSTMENT_REASONS, type ManualStockMovementType } from '@/domain/inventory';
import type { Product } from '@/domain/schemas';
import { notifyError } from '@/lib/notify';
import { registerStockMovement } from '@/services/stock';
import { ADJUSTMENT_REASON_LABELS, PRODUCT_MESSAGES, STOCK_MOVEMENT_LABELS } from '@/ui/messages';
import {
  createStockMovementFormSchema,
  type StockMovementFormOutput,
  type StockMovementFormValues,
} from './stockMovementForm';

const REASON_OPTIONS = ADJUSTMENT_REASONS.map((reason) => ({ value: reason, label: ADJUSTMENT_REASON_LABELS[reason] }));

type StockMovementSheetProps = {
  product: Product;
  type: ManualStockMovementType;
  day: string;
  onClose: () => void;
};

export function StockMovementSheet({ product, type, day, onClose }: StockMovementSheetProps) {
  const isAdjustment = type === 'adjustment';
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StockMovementFormValues, unknown, StockMovementFormOutput>({
    resolver: zodResolver(createStockMovementFormSchema(type, product.quantity)),
    defaultValues: { quantity: '', reason: '' },
  });
  const reasonChoice = useWatch({ control, name: 'reasonChoice' });

  const onSubmit = handleSubmit(({ quantity, reason }) => {
    registerStockMovement({ productId: product.id, type, quantity, reason, day }, notifyError);
    toast.success(PRODUCT_MESSAGES.saved);
    onClose();
  });

  return (
    <EditorSheet title={STOCK_MOVEMENT_LABELS[type]} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label={isAdjustment ? PRODUCT_MESSAGES.countedLabel : PRODUCT_MESSAGES.quantityLabel}
          hint={
            isAdjustment
              ? PRODUCT_MESSAGES.countedHint(product.quantity)
              : type === 'usage'
                ? PRODUCT_MESSAGES.usageHint
                : undefined
          }
          inputMode="numeric"
          autoComplete="off"
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        {isAdjustment ? (
          <>
            <ChoiceGroup
              legend={PRODUCT_MESSAGES.reasonLabel}
              options={REASON_OPTIONS}
              error={errors.reasonChoice?.message}
              inputProps={register('reasonChoice')}
            />
            {reasonChoice === 'other' && (
              <TextField
                label={PRODUCT_MESSAGES.otherReasonLabel}
                autoComplete="off"
                error={errors.reason?.message}
                {...register('reason')}
              />
            )}
          </>
        ) : (
          <TextField
            label={PRODUCT_MESSAGES.noteLabel}
            autoComplete="off"
            error={errors.reason?.message}
            {...register('reason')}
          />
        )}
        <Button type="submit" size="lg">
          {PRODUCT_MESSAGES.save}
        </Button>
      </form>
    </EditorSheet>
  );
}
