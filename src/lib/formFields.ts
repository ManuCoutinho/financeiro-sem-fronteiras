import { z } from 'zod';
import { FORM_MESSAGES } from '@/ui/messages';

const WHOLE_NUMBER = /^\d+$/;

export const wholeNumber = z
  .string()
  .trim()
  .regex(WHOLE_NUMBER, { error: FORM_MESSAGES.invalidWholeNumber })
  .transform(Number);

export const positiveWholeNumber = wholeNumber.refine((value) => value > 0, {
  error: FORM_MESSAGES.invalidPositiveNumber,
});
