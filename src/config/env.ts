import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');
const port = z.coerce.number().int().positive();

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_USE_FIREBASE_EMULATORS: booleanString,
  VITE_FIREBASE_EMULATOR_HOST: z.string().min(1),
  VITE_FIRESTORE_EMULATOR_PORT: port,
  VITE_AUTH_EMULATOR_PORT: port,
  VITE_APP_NAME: z.string().min(1),
  VITE_APP_THEME_COLOR: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  VITE_LOCALE: z.string().min(2),
  VITE_CURRENCY: z.string().length(3),
  VITE_TIME_ZONE: z.string().min(1),
  VITE_EXPIRATION_ALERT_DAYS: z.coerce.number().int().positive(),
  VITE_CSV_DELIMITER: z.string().length(1),
});

export function parseEnv(source: Record<string, unknown>) {
  const parsed = envSchema.parse(source);
  return {
    firebase: {
      apiKey: parsed.VITE_FIREBASE_API_KEY,
      authDomain: parsed.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: parsed.VITE_FIREBASE_PROJECT_ID,
      appId: parsed.VITE_FIREBASE_APP_ID,
    },
    emulators: {
      isEnabled: parsed.VITE_USE_FIREBASE_EMULATORS,
      host: parsed.VITE_FIREBASE_EMULATOR_HOST,
      firestorePort: parsed.VITE_FIRESTORE_EMULATOR_PORT,
      authPort: parsed.VITE_AUTH_EMULATOR_PORT,
    },
    appName: parsed.VITE_APP_NAME,
    themeColor: parsed.VITE_APP_THEME_COLOR,
    locale: parsed.VITE_LOCALE,
    currency: parsed.VITE_CURRENCY,
    timeZone: parsed.VITE_TIME_ZONE,
    expirationAlertDays: parsed.VITE_EXPIRATION_ALERT_DAYS,
    csvDelimiter: parsed.VITE_CSV_DELIMITER,
  } as const;
}

export type Env = ReturnType<typeof parseEnv>;

export const env: Env = parseEnv(import.meta.env);
