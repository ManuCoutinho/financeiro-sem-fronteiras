import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type EditorSheetProps = { title: string; onClose: () => void; children: ReactNode };

/**
 * Full-screen editor. A sheet pinned to the bottom slid behind the iPhone keyboard and let the page
 * underneath show between the form and the keyboard; covering the whole screen and scrolling inside
 * keeps the form on its own, like the sale and expense screens.
 */
export function EditorSheet({ title, onClose, children }: EditorSheetProps) {
  return (
    <Sheet open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        className="inset-0 mx-auto h-dvh max-w-md gap-2 overflow-y-auto overscroll-contain border-none pt-[env(safe-area-inset-top)] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="pr-14">
          <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
        </SheetHeader>
        <div className="px-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
