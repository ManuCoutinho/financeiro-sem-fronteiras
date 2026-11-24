import { doc, onSnapshot } from 'firebase/firestore';
import { BUSINESS_SETTINGS_DOC_ID, COLLECTIONS } from './collections';
import { db } from './firestore';
import type { Unsubscribe } from './snapshots';

export type OwnerAccessListener = {
  onAllowed: () => void;
  onDenied: () => void;
  onFailed: () => void;
};

const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

/**
 * Asks the server whether the signed-in account is the owner: the rules only let the owner read
 * the settings document, even before it exists. Snapshots served from the local cache are ignored,
 * because that cache is shared by every account that has signed in on this device.
 */
export function watchOwnerAccess({ onAllowed, onDenied, onFailed }: OwnerAccessListener): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTIONS.settings, BUSINESS_SETTINGS_DOC_ID),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (!snapshot.metadata.fromCache) onAllowed();
    },
    (error) => {
      if (errorCode(error) === 'permission-denied') onDenied();
      else onFailed();
    },
  );
}
