import { describe, expect, it } from 'vitest';
import { env, parseEnv } from './env';

describe('env', () => {
  it('loads the committed defaults from .env', () => {
    expect(env.locale).toBe('pt-BR');
    expect(env.currency).toBe('BRL');
    expect(env.timeZone).toBe('America/Sao_Paulo');
    expect(env.expirationAlertDays).toBe(30);
    expect(env.emulators.isEnabled).toBe(false);
  });
});

describe('parseEnv', () => {
  it('coerces string values', () => {
    const parsed = parseEnv({
      ...import.meta.env,
      VITE_EXPIRATION_ALERT_DAYS: '15',
      VITE_USE_FIREBASE_EMULATORS: 'true',
    });
    expect(parsed.expirationAlertDays).toBe(15);
    expect(parsed.emulators.isEnabled).toBe(true);
  });

  it('fails fast when a variable is missing', () => {
    expect(() => parseEnv({})).toThrow();
  });
});
