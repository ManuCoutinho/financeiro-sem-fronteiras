import { toast } from 'sonner';
import { toUserMessage } from '@/ui/messages';

export const notifyError = (error: unknown) => {
  toast.error(toUserMessage(error));
};
