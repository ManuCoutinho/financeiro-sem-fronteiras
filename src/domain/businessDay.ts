const ISO_DATE_LOCALE = 'en-CA';
const MONTH_LENGTH = 'YYYY-MM'.length;
const DAY_DIGITS = 2;

export function toBusinessDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(ISO_DATE_LOCALE, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export const toBusinessMonth = (day: string) => day.slice(0, MONTH_LENGTH);

// Business days carry no time zone; anchoring them at UTC midnight keeps day arithmetic exact.
export const dayToDate = (day: string) => new Date(`${day}T00:00:00Z`);

const toDay = (month: string, dayOfMonth: number) => `${month}-${String(dayOfMonth).padStart(DAY_DIGITS, '0')}`;

function getDaysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

export const getMonthDays = (month: string): string[] =>
  Array.from({ length: getDaysInMonth(month) }, (_, index) => toDay(month, index + 1));

export const getMonthRange = (month: string) => ({
  firstDay: toDay(month, 1),
  lastDay: toDay(month, getDaysInMonth(month)),
});

export function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(year, monthNumber - 1 + offset, 1)).toISOString().slice(0, MONTH_LENGTH);
}
