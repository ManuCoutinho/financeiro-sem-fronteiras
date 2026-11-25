import { z } from 'zod';
import { ADJUSTMENT_REASONS, type ManualStockMovementType } from '@/domain/inventory';
import { positiveWholeNumber, wholeNumber } from '@/lib/formFields';
import { ADJUSTMENT_REASON_LABELS, PRODUCT_MESSAGES } from '@/ui/messages';

const REASON_MAX_LENGTH = 200;

export type StockMovementFormValues = { quantity: string; reasonChoice?: string; reason: string };
export type StockMovementFormOutput = { quantity: number; reason: string };

const reason = z.string().trim().max(REASON_MAX_LENGTH);

// An adjustment asks for the counted quantity, which is easier than a signed difference,
// and stores the difference so offline sales recorded meanwhile still add up.
// Its reason comes from a list; only "Outro" asks for a written one.
export function createStockMovementFormSchema(
  type: ManualStockMovementType,
  currentQuantity: number,
): z.ZodType<StockMovementFormOutput, StockMovementFormValues> {
  if (type !== 'adjustment') return z.object({ quantity: positiveWholeNumber, reason });
  return z
    .object({
      quantity: wholeNumber
        .transform((counted) => counted - currentQuantity)
        .refine((difference) => difference !== 0, { error: PRODUCT_MESSAGES.sameQuantity }),
      reasonChoice: z.enum(ADJUSTMENT_REASONS, { error: PRODUCT_MESSAGES.reasonRequired }),
      reason,
    })
    .refine(({ reasonChoice, reason: written }) => reasonChoice !== 'other' || written !== '', {
      error: PRODUCT_MESSAGES.otherReasonRequired,
      path: ['reason'],
    })
    .transform(({ quantity, reasonChoice, reason: written }) => ({
      quantity,
      reason: reasonChoice === 'other' ? written : ADJUSTMENT_REASON_LABELS[reasonChoice],
    }));
}
