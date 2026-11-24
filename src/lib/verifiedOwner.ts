const VERIFIED_OWNER_KEY = 'fsf:verifiedOwner';

/**
 * The account the server last confirmed as the owner on this device. It lets the app open
 * offline without waiting for the server; it never grants access to any other account.
 */
export function isVerifiedOwner(uid: string): boolean {
  try {
    return localStorage.getItem(VERIFIED_OWNER_KEY) === uid;
  } catch {
    return false;
  }
}

export function rememberVerifiedOwner(uid: string) {
  try {
    localStorage.setItem(VERIFIED_OWNER_KEY, uid);
  } catch {
    // Without storage, every launch waits for the server instead.
  }
}

export function forgetVerifiedOwner() {
  try {
    localStorage.removeItem(VERIFIED_OWNER_KEY);
  } catch {
    // Nothing to forget.
  }
}
