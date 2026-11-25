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

  it('turns the counted quantity of an adjustment into the difference, with the reason from the list', () => {
    const schema = createStockMovementFormSchema('adjustment', 5);
    expect(schema.parse({ quantity: '2', reasonChoice: 'loss', reason: '' })).toEqual({
      quantity: -3,
      reason: 'Perda',
    });
    expect(schema.parse({ quantity: '7', reasonChoice: 'count', reason: 'ignored' })).toEqual({
      quantity: 2,
      reason: 'Contagem',
    });
  });

  it('takes the written reason only when "Outro" is chosen', () => {
    const schema = createStockMovementFormSchema('adjustment', 5);
    expect(schema.parse({ quantity: '4', reasonChoice: 'other', reason: ' brinde ' })).toEqual({
      quantity: -1,
      reason: 'brinde',
    });
    expect(firstError(schema.safeParse({ quantity: '4', reasonChoice: 'other', reason: '  ' }))).toBe(
      PRODUCT_MESSAGES.otherReasonRequired,
    );
  });

  it('requires a reason and a different quantity for an adjustment', () => {
    const schema = createStockMovementFormSchema('adjustment', 5);
    expect(firstError(schema.safeParse({ quantity: '5', reasonChoice: 'count', reason: '' }))).toBe(
      PRODUCT_MESSAGES.sameQuantity,
    );
    expect(firstError(schema.safeParse({ quantity: '4', reason: '' }))).toBe(PRODUCT_MESSAGES.reasonRequired);
  });
});
