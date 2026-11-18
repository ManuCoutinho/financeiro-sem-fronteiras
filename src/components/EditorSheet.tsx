import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type EditorSheetProps = { title: string; onClose: () => void; children: ReactNode };

export function EditorSheet({ title, onClose, children }: EditorSheetProps) {
  return (
    <Sheet open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="mx-auto max-h-[90dvh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
        </SheetHeader>
        <div className="px-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
