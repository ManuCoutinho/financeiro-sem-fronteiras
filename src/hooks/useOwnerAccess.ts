import { useEffect, useState } from 'react';
import { forgetVerifiedOwner, isVerifiedOwner, rememberVerifiedOwner } from '@/lib/verifiedOwner';

export type OwnerAccess = 'checking' | 'allowed' | 'denied' | 'failed';

type Result = { uid: string; access: OwnerAccess };

export const ACCESS_CHECK_TIMEOUT_MS = 8000;

/**
 * Keeps the app closed until the server confirms the signed-in account is the owner. The listener
 * stays open, so a later change in the rules (handing the app over to another account) also closes it.
 */
export function useOwnerAccess(uid: string | null): OwnerAccess {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!uid) return;
    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    const settle = (access: OwnerAccess) => {
      if (isActive) setResult({ uid, access });
    };
    // A confirmed owner keeps working through transient errors; anyone else stays locked out.
    const fail = () => {
      if (!isVerifiedOwner(uid)) settle('failed');
    };

    // Firestore never errors while offline or while it cannot refresh the session: it just keeps
    // retrying. Stop waiting on the splash, but keep listening in case the server answers later.
    const timeout = setTimeout(fail, ACCESS_CHECK_TIMEOUT_MS);

    // Loaded on demand so the login screen still ships without the Firestore SDK.
    import('@/services/access')
      .then(({ watchOwnerAccess }) => {
        if (!isActive) return;
        unsubscribe = watchOwnerAccess({
          onAllowed: () => {
            clearTimeout(timeout);
            rememberVerifiedOwner(uid);
            settle('allowed');
          },
          onDenied: () => {
            clearTimeout(timeout);
            forgetVerifiedOwner();
            settle('denied');
          },
          onFailed: fail,
        });
      })
      .catch(fail);

    return () => {
      isActive = false;
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [uid]);

  if (!uid) return 'checking';
  if (result?.uid === uid) return result.access;
  return isVerifiedOwner(uid) ? 'allowed' : 'checking';
}
