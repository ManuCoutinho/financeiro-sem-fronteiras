import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyError } from '@/lib/notify';
import { reopenCashRegister } from '@/services/cashClosings';
import { voidTransaction, type Transaction } from '@/services/transactions';
import { UNDO_MESSAGES } from '@/ui/messages';

type UndoDialogProps = { transaction: Transaction; isDayClosed: boolean; onClose: () => void };

export function UndoDialog({ transaction, isDayClosed, onClose }: UndoDialogProps) {
  const undo = () => {
    // Writes reach the server in order, so the reopening is applied before the rules check the void.
    if (isDayClosed) reopenCashRegister(transaction.day, notifyError);
    voidTransaction(transaction, { isClosed: false }, notifyError);
    toast.success(UNDO_MESSAGES.done);
    onClose();
  };

  const description = isDayClosed
    ? UNDO_MESSAGES.closedDescription
    : transaction.type === 'expense'
      ? UNDO_MESSAGES.confirmExpense
      : UNDO_MESSAGES.confirmSale;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isDayClosed ? UNDO_MESSAGES.closedTitle : UNDO_MESSAGES.confirmTitle}
          </DialogTitle>
          <DialogDescription className="text-base text-foreground">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button variant="destructive" size="lg" onClick={undo}>
            {isDayClosed ? UNDO_MESSAGES.reopenAndUndo : UNDO_MESSAGES.confirm}
          </Button>
          <Button variant="outline" size="lg" onClick={onClose}>
            {UNDO_MESSAGES.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
