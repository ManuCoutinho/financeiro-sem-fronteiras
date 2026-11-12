const ISO_DATE_LOCALE = 'en-CA';

export function toBusinessDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(ISO_DATE_LOCALE, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
