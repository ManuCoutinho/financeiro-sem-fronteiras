import { LOADING_LABEL } from '@/ui/messages';

type LoadStateProps = { isLoading: boolean; error: string | null };

export function LoadState({ isLoading, error }: LoadStateProps) {
  if (error) {
    return (
      <p role="alert" className="font-medium text-destructive">
        {error}
      </p>
    );
  }
  return isLoading ? (
    <p role="status" className="text-muted-foreground">
      {LOADING_LABEL}
    </p>
  ) : null;
}
