import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAYMENT_METHODS } from '@/domain/money';
import type { BusinessSettings } from '@/domain/schemas';
import { useBusinessSettings } from '@/hooks/useCatalog';
import { notifyError } from '@/lib/notify';
import { saveBusinessSettings } from '@/services/catalog';
import { PAYMENT_METHOD_LABELS, SETTINGS_MESSAGES } from '@/ui/messages';
import { businessFormSchema, toBusinessFormValues, type BusinessFormValues } from './settingsForms';

export function BusinessSettingsCard() {
  const settings = useBusinessSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessFormValues, unknown, BusinessSettings>({
    resolver: zodResolver(businessFormSchema),
    values: toBusinessFormValues(settings.data),
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = handleSubmit((data) => {
    saveBusinessSettings(data, notifyError);
    toast.success(SETTINGS_MESSAGES.settingsSaved);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{SETTINGS_MESSAGES.businessTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {settings.error && (
            <p role="alert" className="font-medium text-destructive">
              {settings.error}
            </p>
          )}
          <TextField
            label={SETTINGS_MESSAGES.businessNameLabel}
            autoComplete="organization"
            error={errors.name?.message}
            {...register('name')}
          />
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-base font-semibold">{SETTINGS_MESSAGES.feesLegend}</legend>
            <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.feesHint}</p>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <TextField
                  key={method}
                  label={PAYMENT_METHOD_LABELS[method]}
                  inputMode="decimal"
                  autoComplete="off"
                  error={errors.feePercentByMethod?.[method]?.message}
                  {...register(`feePercentByMethod.${method}`)}
                />
              ))}
            </div>
          </fieldset>
          <TextField
            label={SETTINGS_MESSAGES.expirationAlertDaysLabel}
            inputMode="numeric"
            autoComplete="off"
            error={errors.expirationAlertDays?.message}
            {...register('expirationAlertDays')}
          />
          <Button type="submit" size="lg" disabled={settings.isLoading}>
            {SETTINGS_MESSAGES.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
