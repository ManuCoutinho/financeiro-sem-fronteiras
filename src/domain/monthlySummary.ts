import { getMonthDays } from './businessDay';
import { summarizeCashRegister, type SaleType, type Transaction } from './cashRegister';

export type MonthlyTransaction = Transaction & {
  day: string;
  itemId: string;
  description: string;
  quantity: number;
};

export type StockValueItem = { quantity: number; costCents: number };

export type DailyTotal = { day: string; salesCents: number; expensesCents: number };

export type TopItem = {
  type: SaleType;
  itemId: string;
  description: string;
  quantity: number;
  revenueCents: number;
};

export type MonthlySummaryInput = {
  month: string;
  transactions: MonthlyTransaction[];
  products: StockValueItem[];
  topItemsLimit: number;
};

const receivedCents = (transaction: Transaction) => transaction.grossCents - transaction.discountCents;

function getDailyTotals(month: string, transactions: MonthlyTransaction[]): DailyTotal[] {
  const totalsByDay = new Map(getMonthDays(month).map((day) => [day, { day, salesCents: 0, expensesCents: 0 }]));
  for (const transaction of transactions) {
    const total = totalsByDay.get(transaction.day);
    if (!total) continue;
    if (transaction.type === 'expense') total.expensesCents += transaction.grossCents;
    else total.salesCents += receivedCents(transaction);
  }
  return [...totalsByDay.values()];
}

function getTopItems(sales: MonthlyTransaction[], limit: number): TopItem[] {
  const itemsByKey = new Map<string, TopItem>();
  for (const sale of sales) {
    const type = sale.type as SaleType;
    const key = `${type}:${sale.itemId}`;
    const item = itemsByKey.get(key) ?? {
      type,
      itemId: sale.itemId,
      description: sale.description,
      quantity: 0,
      revenueCents: 0,
    };
    item.quantity += sale.quantity;
    item.revenueCents += receivedCents(sale);
    itemsByKey.set(key, item);
  }
  return [...itemsByKey.values()]
    .sort((first, second) => second.quantity - first.quantity || second.revenueCents - first.revenueCents)
    .slice(0, limit);
}

const getStockValueCents = (products: StockValueItem[]) =>
  products.reduce((total, product) => total + Math.max(product.quantity, 0) * product.costCents, 0);

export function summarizeMonth({ month, transactions, products, topItemsLimit }: MonthlySummaryInput) {
  const activeTransactions = transactions.filter((transaction) => !transaction.isVoided);
  const sales = activeTransactions.filter((transaction) => transaction.type !== 'expense');
  const { totalsByMethod, salesCents, feesCents, netCents, servicesCents, productsCents, expensesCents } =
    summarizeCashRegister(activeTransactions);

  return {
    totalsByMethod,
    salesCents,
    feesCents,
    netCents,
    servicesCents,
    productsCents,
    expensesCents,
    resultCents: netCents - expensesCents,
    saleCount: sales.length,
    averageTicketCents: sales.length === 0 ? 0 : Math.round(salesCents / sales.length),
    stockValueCents: getStockValueCents(products),
    topItems: getTopItems(sales, topItemsLimit),
    dailyTotals: getDailyTotals(month, activeTransactions),
  };
}

export type MonthlySummary = ReturnType<typeof summarizeMonth>;
