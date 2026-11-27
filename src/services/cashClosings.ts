import { arrayUnion, doc, onSnapshot, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { summarizeCashRegister, type Transaction } from '@/domain/cashRegister';
import { storedCashClosingSchema, type StoredCashClosing } from '@/domain/schemas';
import { COLLECTIONS } from './collections';
import { db } from './firestore';
import { commitInBackground, type Listener, type OnError, type Unsubscribe } from './snapshots';

export type CashClosing = StoredCashClosing & { closedAt: Date | null };

const closingRef = (day: string) => doc(db, COLLECTIONS.cashClosings, day);

export function subscribeCashClosing(day: string, { onNext, onError }: Listener<CashClosing | null>): Unsubscribe {
  return onSnapshot(
    closingRef(day),
    (snapshot) => {
      const result = storedCashClosingSchema.safeParse(snapshot.data());
      if (!result.success) return onNext(null);
      const closedAt = snapshot.get('closedAt', { serverTimestamps: 'estimate' }) as Timestamp | null | undefined;
      onNext({ ...result.data, closedAt: closedAt?.toDate() ?? null });
    },
    onError,
  );
}

export type CloseCashRegister = { day: string; transactions: Transaction[] };

// merge keeps the reopening history of a day that is being closed again.
export function closeCashRegister({ day, transactions }: CloseCashRegister, onError: OnError) {
  const closing = summarizeCashRegister(transactions);
  commitInBackground(
    setDoc(closingRef(day), { ...closing, isClosed: true, closedAt: serverTimestamp() }, { merge: true }),
    onError,
  );
}

// serverTimestamp() is not allowed inside arrays, so the reopening time comes from the device clock.
export function reopenCashRegister(day: string, onError: OnError) {
  commitInBackground(updateDoc(closingRef(day), { isClosed: false, reopenings: arrayUnion(Timestamp.now()) }), onError);
}
