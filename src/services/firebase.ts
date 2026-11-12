import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { env } from '../config/env';

const app = initializeApp(env.firebase);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, { localCache: persistentLocalCache() });

if (env.emulators.isEnabled) {
  const { host, authPort, firestorePort } = env.emulators;
  connectAuthEmulator(auth, `http://${host}:${authPort}`);
  connectFirestoreEmulator(db, host, firestorePort);
}
