import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { z } from 'zod';

export type OnError = (error: unknown) => void;
export type Listener<T> = { onNext: (data: T) => void; onError: OnError };
export type Unsubscribe = () => void;
export type Subscribe<T> = (listener: Listener<T>) => Unsubscribe;

export type WithId<T> = T & { id: string };
export type SyncedDoc<T> = WithId<T> & { createdAt: Date | null; hasPendingWrites: boolean };

// Offline writes only resolve once the server acknowledges them, so callers never await;
// the local cache shows the change immediately and errors surface through onError.
export function commitInBackground(write: Promise<unknown>, onError: OnError) {
  write.catch(onError);
}

// Documents that fail validation are skipped instead of breaking the whole list.
export function parseDoc<T extends object>(
  snapshot: QueryDocumentSnapshot<DocumentData>,
  schema: z.ZodType<T>,
): WithId<T> | null {
  const result = schema.safeParse(snapshot.data({ serverTimestamps: 'estimate' }));
  return result.success ? { ...result.data, id: snapshot.id } : null;
}

export function parseDocs<T extends object>(
  snapshots: QueryDocumentSnapshot<DocumentData>[],
  schema: z.ZodType<T>,
): WithId<T>[] {
  return snapshots.map((snapshot) => parseDoc(snapshot, schema)).filter((item) => item !== null);
}

export function parseSyncedDocs<T extends object>(
  snapshots: QueryDocumentSnapshot<DocumentData>[],
  schema: z.ZodType<T>,
): SyncedDoc<T>[] {
  return snapshots
    .map((snapshot) => {
      const item = parseDoc(snapshot, schema);
      if (!item) return null;
      const createdAt = snapshot.get('createdAt', { serverTimestamps: 'estimate' }) as Timestamp | null;
      return { ...item, createdAt: createdAt?.toDate() ?? null, hasPendingWrites: snapshot.metadata.hasPendingWrites };
    })
    .filter((item) => item !== null)
    .sort((first, second) => (first.createdAt?.getTime() ?? 0) - (second.createdAt?.getTime() ?? 0));
}
