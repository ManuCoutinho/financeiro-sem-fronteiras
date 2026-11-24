import { CircleCheck, Download } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
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
import { getInstallMode, promptInstall, subscribeToInstallMode } from '@/lib/installApp';
import { INSTALL_MESSAGES } from '@/ui/messages';

export function InstallAppButton() {
  const mode = useSyncExternalStore(subscribeToInstallMode, getInstallMode);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (mode === 'installed') {
    return (
      <p className="flex items-center gap-2 text-muted-foreground">
        <CircleCheck aria-hidden="true" className="size-5 shrink-0" /> {INSTALL_MESSAGES.installed}
      </p>
    );
  }

  const install = async () => {
    if (mode !== 'prompt') {
      setIsHelpOpen(true);
      return;
    }
    const outcome = await promptInstall();
    if (outcome === 'accepted') toast.success(INSTALL_MESSAGES.accepted);
    // The offer is gone (dismissed or expired): the menu steps still work.
    if (outcome === 'unavailable') setIsHelpOpen(true);
  };

  const isIos = mode === 'ios';
  const steps = isIos ? INSTALL_MESSAGES.iosSteps : INSTALL_MESSAGES.manualSteps;

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="lg" onClick={install}>
        <Download aria-hidden="true" /> {INSTALL_MESSAGES.install}
      </Button>
      <p className="text-sm text-muted-foreground">{INSTALL_MESSAGES.installHint}</p>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isIos ? INSTALL_MESSAGES.iosTitle : INSTALL_MESSAGES.manualTitle}
            </DialogTitle>
            <DialogDescription asChild>
              <ol className="flex list-decimal flex-col gap-2 pl-5 text-left text-base text-foreground">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </DialogDescription>
          </DialogHeader>
          {!isIos && <p className="text-sm text-muted-foreground">{INSTALL_MESSAGES.manualNote}</p>}
          <DialogFooter>
            <Button size="lg" onClick={() => setIsHelpOpen(false)}>
              {INSTALL_MESSAGES.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
