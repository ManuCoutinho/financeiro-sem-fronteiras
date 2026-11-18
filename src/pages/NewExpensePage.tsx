import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PATHS } from '@/app/paths';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { expenseFormSchema, type ExpenseFormOutput, type ExpenseFormValues } from '@/components/expense/expenseForm';
import { PageHeader } from '@/components/PageHeader';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EXPENSE_CATEGORIES } from '@/domain/cashRegister';
import { PAYMENT_METHODS } from '@/domain/money';
import { useCashClosing } from '@/hooks/useCashClosing';
import { useToday } from '@/hooks/useToday';
import { notifyError } from '@/lib/notify';
import { registerExpense, voidTransaction } from '@/services/transactions';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_MESSAGES,
  LOADING_LABEL,
  MESSAGES,
  PAGE_TITLES,
  PAYMENT_METHOD_LABELS,
  SALE_MESSAGES,
} from '@/ui/messages';

const UNDO_TOAST_DURATION_MS = 8000;

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((category) => ({
  value: category,
  label: EXPENSE_CATEGORY_LABELS[category],
}));
const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] }));

export function NewExpensePage() {
  const navigate = useNavigate();
  const today = useToday();
  const closing = useCashClosing(today);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { amount: '', description: '' },
  });

  const onSubmit = handleSubmit(({ category, amount, description, paymentMethod }) => {
    const expense = { category, description, amountCents: amount, paymentMethod, day: today };
    const transactionId = registerExpense(expense, notifyError);
    const undo = () => {
      const voidable = { id: transactionId, type: 'expense' as const, itemId: category, quantity: 1, day: today };
      if (voidTransaction(voidable, closing.data, notifyError) === 'dayClosed')
        toast.error(MESSAGES.dayClosedReopenFirst);
      else toast.success(EXPENSE_MESSAGES.voided);
    };
    toast.success(EXPENSE_MESSAGES.registered, {
      action: { label: MESSAGES.undo, onClick: undo },
      duration: UNDO_TOAST_DURATION_MS,
    });
    navigate(PATHS.cashRegister);
  });

  const header = <PageHeader title={PAGE_TITLES.newExpense} hasBackButton />;
  if (closing.isLoading) {
    return (
      <>
        {header}
        <p role="status" className="text-muted-foreground">
          {LOADING_LABEL}
        </p>
      </>
    );
  }
  if (closing.isClosed) {
    return (
      <>
        {header}
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p role="status">{EXPENSE_MESSAGES.dayClosed}</p>
            <Button asChild variant="outline">
              <Link to={PATHS.cashRegister}>{SALE_MESSAGES.backToRegister}</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <ChoiceGroup
          legend={EXPENSE_MESSAGES.categoryLegend}
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          inputProps={register('category')}
        />
        <TextField
          label={EXPENSE_MESSAGES.amountLabel}
          inputMode="decimal"
          autoComplete="off"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <TextField
          label={EXPENSE_MESSAGES.descriptionLabel}
          hint={EXPENSE_MESSAGES.descriptionHint}
          autoComplete="off"
          error={errors.description?.message}
          {...register('description')}
        />
        <ChoiceGroup
          legend={EXPENSE_MESSAGES.paymentLegend}
          hint={EXPENSE_MESSAGES.paymentHint}
          options={PAYMENT_OPTIONS}
          error={errors.paymentMethod?.message}
          inputProps={register('paymentMethod')}
        />
        <Button type="submit" size="lg">
          {EXPENSE_MESSAGES.save}
        </Button>
      </form>
    </>
  );
}
