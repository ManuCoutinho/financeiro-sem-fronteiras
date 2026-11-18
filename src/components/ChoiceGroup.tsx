import { useId, type ComponentProps } from 'react';

type Option = { value: string; label: string };

type ChoiceGroupProps = {
  legend: string;
  options: readonly Option[];
  hint?: string;
  error?: string;
  inputProps: Omit<ComponentProps<'input'>, 'type' | 'value'>;
};

export function ChoiceGroup({ legend, options, hint, error, inputProps }: ChoiceGroupProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset aria-describedby={describedBy} aria-invalid={error ? true : undefined} className="flex flex-col gap-2">
      <legend className="mb-1 text-base font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-touch cursor-pointer items-center justify-center rounded-2xl border border-border bg-card px-3 py-2 text-center text-base font-semibold transition-colors has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input type="radio" value={option.value} className="sr-only" {...inputProps} />
            {option.label}
          </label>
        ))}
      </div>
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
    </fieldset>
  );
}
