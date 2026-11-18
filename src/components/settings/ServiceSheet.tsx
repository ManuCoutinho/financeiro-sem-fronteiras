import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CheckboxField } from '@/components/CheckboxField';
import { EditorSheet } from '@/components/EditorSheet';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import type { Service } from '@/domain/schemas';
import { notifyError } from '@/lib/notify';
import { saveService } from '@/services/catalog';
import { SETTINGS_MESSAGES } from '@/ui/messages';
import { serviceFormSchema, toServiceFormValues, type ServiceFormValues } from './settingsForms';

type ServiceSheetProps = { service: Service | null; nextSortOrder: number; onClose: () => void };

export function ServiceSheet({ service, nextSortOrder, onClose }: ServiceSheetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues, unknown, z.output<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toServiceFormValues(service),
  });

  const onSubmit = handleSubmit(({ name, price, isActive }) => {
    saveService(
      { name, priceCents: price, isActive, sortOrder: service?.sortOrder ?? nextSortOrder },
      notifyError,
      service?.id,
    );
    toast.success(SETTINGS_MESSAGES.serviceSaved);
    onClose();
  });

  return (
    <EditorSheet title={service ? SETTINGS_MESSAGES.editService : SETTINGS_MESSAGES.addService} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label={SETTINGS_MESSAGES.nameLabel}
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label={SETTINGS_MESSAGES.priceLabel}
          inputMode="decimal"
          autoComplete="off"
          error={errors.price?.message}
          {...register('price')}
        />
        <CheckboxField
          label={SETTINGS_MESSAGES.isActiveLabel}
          hint={SETTINGS_MESSAGES.isActiveHint}
          {...register('isActive')}
        />
        <Button type="submit" size="lg">
          {SETTINGS_MESSAGES.save}
        </Button>
      </form>
    </EditorSheet>
  );
}
