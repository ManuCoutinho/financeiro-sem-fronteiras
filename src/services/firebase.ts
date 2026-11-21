import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { env } from '../config/env';

export const app = initializeApp(env.firebase);

// getAuth() would also register the popup/redirect resolver, which loads Google's auth iframe
// (~130 KB) on every launch. useAuth passes the resolver only when a redirect is in flight.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});
export const googleProvider = new GoogleAuthProvider();

if (env.emulators.isEnabled) {
  connectAuthEmulator(auth, `http://${env.emulators.host}:${env.emulators.authPort}`);
}
