import { PAYMENT_METHODS, type PaymentMethod } from './money';

export const TRANSACTION_TYPES = ['service', 'product', 'expense'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type Transaction = {
  type: TransactionType;
  paymentMethod: PaymentMethod;
  isVoided: boolean;
  grossCents: number;
  discountCents: number;
  feeCents: number;
  netCents: number;
};

const emptyTotalsByMethod = () =>
  Object.fromEntries(PAYMENT_METHODS.map((method) => [method, 0])) as Record<PaymentMethod, number>;

export function summarizeCashRegister(transactions: Transaction[], openingCashCents = 0) {
  const totalsByMethod = emptyTotalsByMethod();
  let salesCents = 0;
  let feesCents = 0;
  let netCents = 0;
  let servicesCents = 0;
  let productsCents = 0;
  let expensesCents = 0;
  let cashExpensesCents = 0;

  for (const transaction of transactions.filter((item) => !item.isVoided)) {
    if (transaction.type === 'expense') {
      expensesCents += transaction.grossCents;
      if (transaction.paymentMethod === 'cash') cashExpensesCents += transaction.grossCents;
      continue;
    }
    const receivedCents = transaction.grossCents - transaction.discountCents;
    totalsByMethod[transaction.paymentMethod] += receivedCents;
    salesCents += receivedCents;
    feesCents += transaction.feeCents;
    netCents += transaction.netCents;
    if (transaction.type === 'service') servicesCents += receivedCents;
    else productsCents += receivedCents;
  }

  return {
    totalsByMethod,
    salesCents,
    feesCents,
    netCents,
    servicesCents,
    productsCents,
    expensesCents,
    expectedCashCents: openingCashCents + totalsByMethod.cash - cashExpensesCents,
  };
}
