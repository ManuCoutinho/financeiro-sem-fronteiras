import { useId, type ComponentProps } from 'react';

type CheckboxFieldProps = Omit<ComponentProps<'input'>, 'type'> & { label: string; hint?: string };

export function CheckboxField({ label, hint, id, ...inputProps }: CheckboxFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="flex items-start gap-3">
      <input
        id={fieldId}
        type="checkbox"
        aria-describedby={hint ? hintId : undefined}
        className="mt-0.5 size-6 shrink-0 accent-foreground"
        {...inputProps}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="min-h-6 text-base font-medium">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
