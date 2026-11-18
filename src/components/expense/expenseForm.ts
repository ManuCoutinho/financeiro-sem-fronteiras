import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '@/domain/cashRegister';
import { PAYMENT_METHODS } from '@/domain/money';
import { parseAmountToCents } from '@/ui/format';
import { EXPENSE_MESSAGES } from '@/ui/messages';

const DESCRIPTION_MAX_LENGTH = 200;

export const expenseFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { error: EXPENSE_MESSAGES.chooseCategory }),
  amount: z.string().transform((text, context) => {
    const cents = parseAmountToCents(text);
    if (cents !== null && cents > 0) return cents;
    context.addIssue({ code: 'custom', message: EXPENSE_MESSAGES.invalidAmount });
    return z.NEVER;
  }),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: EXPENSE_MESSAGES.choosePayment }),
});

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
export type ExpenseFormOutput = z.output<typeof expenseFormSchema>;
