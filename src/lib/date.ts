// Centralized date formatting helpers to ensure server/client consistency.
// Using a fixed locale and UTC timezone removes hydration mismatches caused
// by differing host / browser locales & time zones.

const PRINT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC', // Fix timezone so SSR and client always align.
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatPrintDate(date: Date): string {
  return PRINT_DATE_FORMATTER.format(date);
}

export function todayPrintDate(): string {
  return formatPrintDate(new Date());
}
