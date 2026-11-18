import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { env } from '../config/env';
import { app } from './firebase';

// Kept apart from auth so the login screen loads without the Firestore SDK.
export const db = initializeFirestore(app, { localCache: persistentLocalCache() });

if (env.emulators.isEnabled) {
  connectFirestoreEmulator(db, env.emulators.host, env.emulators.firestorePort);
}
