import { maskMoneyInput, maskPercentInput } from '@/ui/format';
import { TextField, type TextFieldProps } from './TextField';

type MaskedFieldProps = Omit<TextFieldProps, 'startAdornment' | 'endAdornment' | 'inputMode'>;

/**
 * Money input with a fixed "R$" and a mask that fills from the cents. It still hands the form the
 * formatted text ("1.234,56"), which parseAmountToCents reads, so form schemas stay the same.
 */
export function MoneyField({ onChange, ...props }: MaskedFieldProps) {
  return (
    <TextField
      inputMode="numeric"
      autoComplete="off"
      placeholder="0,00"
      {...props}
      startAdornment="R$"
      onChange={(event) => {
        event.target.value = maskMoneyInput(event.target.value);
        onChange?.(event);
      }}
    />
  );
}

/** Percent input with a fixed "%": whole percentages with up to two decimals, like 3,5. */
export function PercentField({ onChange, ...props }: MaskedFieldProps) {
  return (
    <TextField
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      {...props}
      endAdornment="%"
      onChange={(event) => {
        event.target.value = maskPercentInput(event.target.value);
        onChange?.(event);
      }}
    />
  );
}
