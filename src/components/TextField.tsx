import { useId, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Fixed text inside the field, before the value (e.g. "R$"). */
  startAdornment?: string;
  /** Fixed text inside the field, after the value (e.g. "%"). */
  endAdornment?: string;
};

export function TextField({
  label,
  error,
  hint,
  id,
  className,
  startAdornment,
  endAdornment,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const input = (
    <Input
      id={fieldId}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...inputProps}
      className={cn(startAdornment && 'pl-12', endAdornment && 'pr-10')}
    />
  );

  return (
    <div className={className ?? 'flex flex-col gap-2'}>
      <Label htmlFor={fieldId} className="text-base">
        {label}
      </Label>
      {startAdornment || endAdornment ? (
        <div className="relative">
          {startAdornment && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-semibold text-muted-foreground"
            >
              {startAdornment}
            </span>
          )}
          {input}
          {endAdornment && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-muted-foreground"
            >
              {endAdornment}
            </span>
          )}
        </div>
      ) : (
        input
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
