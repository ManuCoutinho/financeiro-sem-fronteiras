import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SALE_MESSAGES } from '@/ui/messages';

const MIN_QUANTITY = 1;

type QuantityStepperProps = { value: number; onChange: (value: number) => void };

export function QuantityStepper({ value, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span id="quantity-label" className="text-base font-medium">
        {SALE_MESSAGES.quantityLabel}
      </span>
      <div role="group" aria-labelledby="quantity-label" className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={SALE_MESSAGES.decreaseQuantity}
          disabled={value <= MIN_QUANTITY}
          onClick={() => onChange(value - 1)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <output aria-live="polite" className="min-w-8 text-center text-2xl font-bold tabular-nums">
          {value}
        </output>
        <Button
          variant="outline"
          size="icon"
          aria-label={SALE_MESSAGES.increaseQuantity}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
