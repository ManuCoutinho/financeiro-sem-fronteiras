import { describe, expect, it } from 'vitest';
import { MESSAGES, toUserMessage } from './messages';

describe('toUserMessage', () => {
  it('maps known Firebase error codes', () => {
    expect(toUserMessage({ code: 'permission-denied' })).toBe(MESSAGES.permissionDenied);
  });

  it('falls back to a generic message', () => {
    expect(toUserMessage(new Error('boom'))).toBe(MESSAGES.unexpectedError);
  });
});
