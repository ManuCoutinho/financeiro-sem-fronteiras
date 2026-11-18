import { describe, expect, it } from 'vitest';
import { FORM_MESSAGES } from '@/ui/messages';
import {
  businessFormSchema,
  productFormSchema,
  serviceFormSchema,
  toBusinessFormValues,
  toProductFormValues,
  toServiceFormValues,
} from './settingsForms';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('serviceFormSchema', () => {
  it('turns the typed price into cents', () => {
    expect(serviceFormSchema.parse({ name: ' Design ', price: '59,90', isActive: true })).toEqual({
      name: 'Design',
      price: 5990,
      isActive: true,
    });
  });

  it('explains what is wrong in Portuguese', () => {
    expect(firstError(serviceFormSchema.safeParse({ name: '', price: '10', isActive: true }))).toBe(
      FORM_MESSAGES.required,
    );
    expect(firstError(serviceFormSchema.safeParse({ name: 'Design', price: 'dez', isActive: true }))).toBe(
      FORM_MESSAGES.invalidAmount,
    );
  });

  it('round-trips an existing service', () => {
    const values = toServiceFormValues({ id: 's1', name: 'Design', priceCents: 6000, isActive: false, sortOrder: 0 });
    expect(values).toEqual({ name: 'Design', price: '60,00', isActive: false });
    expect(serviceFormSchema.parse(values).price).toBe(6000);
  });
});

describe('productFormSchema', () => {
  const values = {
    name: 'Sérum',
    salePrice: '40',
    cost: '15,5',
    quantity: '3',
    minStock: '1',
    expiresOn: '',
    isActive: true,
  };

  it('parses amounts, whole numbers and an empty expiration', () => {
    expect(productFormSchema.parse(values)).toEqual({
      name: 'Sérum',
      salePrice: 4000,
      cost: 1550,
      quantity: 3,
      minStock: 1,
      expiresOn: null,
      isActive: true,
    });
    expect(productFormSchema.parse({ ...values, expiresOn: '2027-01-31' }).expiresOn).toBe('2027-01-31');
  });

  it('rejects fractional or negative quantities', () => {
    expect(firstError(productFormSchema.safeParse({ ...values, quantity: '1,5' }))).toBe(
      FORM_MESSAGES.invalidWholeNumber,
    );
    expect(firstError(productFormSchema.safeParse({ ...values, minStock: '-1' }))).toBe(
      FORM_MESSAGES.invalidWholeNumber,
    );
  });

  it('starts a new product empty and shows negative stock as zero when editing', () => {
    expect(toProductFormValues(null).quantity).toBe('0');
    expect(
      toProductFormValues({
        id: 'p1',
        name: 'Sérum',
        salePriceCents: 4000,
        costCents: 1500,
        quantity: -2,
        minStock: 1,
        expiresOn: null,
        isActive: true,
        sortOrder: 0,
      }).quantity,
    ).toBe('0');
  });
});

describe('businessFormSchema', () => {
  const settings = {
    name: 'Studio',
    feePercentByMethod: { pix: 0, cash: 0, debit: 1.99, credit: 3.5 },
    expirationAlertDays: 30,
  };

  it('round-trips the settings with decimal commas', () => {
    const values = toBusinessFormValues(settings);
    expect(values.feePercentByMethod).toEqual({ pix: '0', cash: '0', debit: '1,99', credit: '3,5' });
    expect(businessFormSchema.parse(values)).toEqual(settings);
  });

  it('rejects fees above 100% and zero alert days', () => {
    const values = toBusinessFormValues(settings);
    expect(
      firstError(
        businessFormSchema.safeParse({
          ...values,
          feePercentByMethod: { ...values.feePercentByMethod, credit: '150' },
        }),
      ),
    ).toBe(FORM_MESSAGES.invalidPercent);
    expect(firstError(businessFormSchema.safeParse({ ...values, expirationAlertDays: '0' }))).toBe(
      FORM_MESSAGES.invalidPositiveNumber,
    );
  });
});
