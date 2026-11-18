import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { env } from '../config/env';

export const app = initializeApp(env.firebase);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

if (env.emulators.isEnabled) {
  connectAuthEmulator(auth, `http://${env.emulators.host}:${env.emulators.authPort}`);
}
