import { toast } from 'sonner';
import { REJECTION_MESSAGES, toUserMessage } from '@/ui/messages';

export const notifyError = (error: unknown) => {
  toast.error(toUserMessage(error));
};

const errorCode = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

/**
 * For writes that already show on screen (sales, expenses): when the server refuses one, Firestore
 * takes it off the list, and this says so plainly instead of a generic error.
 */
export const notifyRejected = (title: string) => (error: unknown) => {
  toast.error(title, {
    description: errorCode(error) === 'permission-denied' ? REJECTION_MESSAGES.denied : REJECTION_MESSAGES.other,
  });
};
