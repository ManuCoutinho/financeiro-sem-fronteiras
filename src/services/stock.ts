import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import { toSignedQuantity, type StockMovementType } from '@/domain/inventory';
import {
  newStockMovementSchema,
  storedStockMovementSchema,
  type NewStockMovement,
  type StoredStockMovement,
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

export type StockMovement = SyncedDoc<StoredStockMovement>;

export type StockChange = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  transactionId: string | null;
  day: string;
};

export function addStockChange(batch: WriteBatch, change: StockChange) {
  batch.update(doc(db, COLLECTIONS.products, change.productId), { quantity: increment(change.quantity) });
  batch.set(doc(collection(db, COLLECTIONS.stockMovements)), { ...change, createdAt: serverTimestamp() });
}

export function registerStockMovement(movement: NewStockMovement, onError: OnError) {
  const { productId, type, quantity, reason, day } = newStockMovementSchema.parse(movement);
  const batch = writeBatch(db);
  addStockChange(batch, {
    productId,
    type,
    quantity: toSignedQuantity(type, quantity),
    reason: reason || null,
    transactionId: null,
    day,
  });
  commitInBackground(batch.commit(), onError);
}

export function subscribeProductMovements(
  productId: string,
  { onNext, onError }: Listener<StockMovement[]>,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, COLLECTIONS.stockMovements), where('productId', '==', productId)),
    { includeMetadataChanges: true },
    (snapshot) => onNext(parseSyncedDocs(snapshot.docs, storedStockMovementSchema).reverse()),
    onError,
  );
}
