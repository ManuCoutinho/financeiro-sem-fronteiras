import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOADING_LABEL, MESSAGES } from '@/ui/messages';

type LoadStateProps = { isLoading: boolean; error: string | null };

/**
 * Loading and error line for a list. Callers show their empty state only when this shows nothing,
 * so an error never sits next to "nothing here yet".
 */
export function LoadState({ isLoading, error }: LoadStateProps) {
  if (error) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p role="alert" className="font-medium text-destructive">
          {error}
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RotateCw aria-hidden="true" /> {MESSAGES.retry}
        </Button>
      </div>
    );
  }
  return isLoading ? (
    <p role="status" className="text-muted-foreground">
      {LOADING_LABEL}
    </p>
  ) : null;
}

/** True when the data is ready to be shown, empty or not. */
export const isReady = ({ isLoading, error }: LoadStateProps) => !isLoading && !error;
