import { collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { isDayClosed } from '@/domain/cashRegister';
import { calculateNet } from '@/domain/money';
import {
  newExpenseSchema,
  newSaleSchema,
  storedTransactionSchema,
  type NewExpense,
  type NewSale,
  type StoredTransaction,
} from '@/domain/schemas';
import { COLLECTIONS } from './collections';
import { db } from './firebase';
import {
  commitInBackground,
  parseSyncedDocs,
  type Listener,
  type OnError,
  type SyncedDoc,
  type Unsubscribe,
} from './snapshots';
import { addStockChange } from './stock';

export type Transaction = SyncedDoc<StoredTransaction>;

export type DayRange = { firstDay: string; lastDay: string };

export function subscribeTransactions(
  { firstDay, lastDay }: DayRange,
  { onNext, onError }: Listener<Transaction[]>,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, COLLECTIONS.transactions), where('day', '>=', firstDay), where('day', '<=', lastDay)),
    { includeMetadataChanges: true },
    (snapshot) => onNext(parseSyncedDocs(snapshot.docs, storedTransactionSchema)),
    onError,
  );
}

export function registerSale(sale: NewSale, onError: OnError): string {
  const { type, itemId, description, quantity, unitPriceCents, discountCents, paymentMethod, feePercent, day } =
    newSaleSchema.parse(sale);
  const batch = writeBatch(db);
  const transactionRef = doc(collection(db, COLLECTIONS.transactions));
  const grossCents = unitPriceCents * quantity;
  const { feeCents, netCents } = calculateNet(grossCents, discountCents, feePercent);

  batch.set(transactionRef, {
    type,
    itemId,
    description,
    quantity,
    grossCents,
    discountCents,
    paymentMethod,
    feeCents,
    netCents,
    expenseCategory: null,
    day,
    createdAt: serverTimestamp(),
    isVoided: false,
  });

  if (type === 'product') {
    addStockChange(batch, {
      productId: itemId,
      type: 'sale',
      quantity: -quantity,
      reason: null,
      transactionId: transactionRef.id,
      day,
    });
  }

  commitInBackground(batch.commit(), onError);
  return transactionRef.id;
}

export function registerExpense(expense: NewExpense, onError: OnError): string {
  const { category, description, amountCents, paymentMethod, day } = newExpenseSchema.parse(expense);
  const transactionRef = doc(collection(db, COLLECTIONS.transactions));
  const batch = writeBatch(db);

  batch.set(transactionRef, {
    type: 'expense',
    itemId: category,
    description,
    quantity: 1,
    grossCents: amountCents,
    discountCents: 0,
    paymentMethod,
    feeCents: 0,
    netCents: amountCents,
    expenseCategory: category,
    day,
    createdAt: serverTimestamp(),
    isVoided: false,
  });

  commitInBackground(batch.commit(), onError);
  return transactionRef.id;
}

export type VoidableTransaction = Pick<Transaction, 'id' | 'type' | 'itemId' | 'quantity' | 'day'>;
export type VoidResult = 'voided' | 'dayClosed';

export function voidTransaction(
  transaction: VoidableTransaction,
  closing: { isClosed: boolean } | null,
  onError: OnError,
): VoidResult {
  if (isDayClosed(closing)) return 'dayClosed';

  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.transactions, transaction.id), { isVoided: true, voidedAt: serverTimestamp() });

  if (transaction.type === 'product') {
    addStockChange(batch, {
      productId: transaction.itemId,
      type: 'reversal',
      quantity: transaction.quantity,
      reason: null,
      transactionId: transaction.id,
      day: transaction.day,
    });
  }

  commitInBackground(batch.commit(), onError);
  return 'voided';
}
