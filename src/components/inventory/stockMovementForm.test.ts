import { describe, expect, it } from 'vitest';
import { FORM_MESSAGES, PRODUCT_MESSAGES } from '@/ui/messages';
import { createStockMovementFormSchema } from './stockMovementForm';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('createStockMovementFormSchema', () => {
  it('accepts a positive restock with an optional note', () => {
    expect(createStockMovementFormSchema('restock', 3).parse({ quantity: ' 10 ', reason: '' })).toEqual({
      quantity: 10,
      reason: '',
    });
  });

  it('rejects zero or fractional quantities for usage', () => {
    const schema = createStockMovementFormSchema('usage', 3);
    expect(firstError(schema.safeParse({ quantity: '0', reason: '' }))).toBe(FORM_MESSAGES.invalidPositiveNumber);
    expect(firstError(schema.safeParse({ quantity: '1,5', reason: '' }))).toBe(FORM_MESSAGES.invalidWholeNumber);
  });

  it('turns the counted quantity of an adjustment into the difference', () => {
    const schema = createStockMovementFormSchema('adjustment', 5);
    expect(schema.parse({ quantity: '2', reason: ' perda ' })).toEqual({ quantity: -3, reason: 'perda' });
    expect(schema.parse({ quantity: '7', reason: 'contagem' })).toEqual({ quantity: 2, reason: 'contagem' });
  });

  it('requires a reason and a different quantity for an adjustment', () => {
    const schema = createStockMovementFormSchema('adjustment', 5);
    expect(firstError(schema.safeParse({ quantity: '5', reason: 'contagem' }))).toBe(PRODUCT_MESSAGES.sameQuantity);
    expect(firstError(schema.safeParse({ quantity: '4', reason: '  ' }))).toBe(PRODUCT_MESSAGES.reasonRequired);
  });
});
