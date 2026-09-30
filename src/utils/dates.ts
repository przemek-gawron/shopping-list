/** Dates are kept as local YYYY-MM-DD strings so they sort and compare as text. */

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = fromISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function today(): string {
  return toISO(new Date());
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const date = fromISO(iso);
  const offset = (date.getDay() + 6) % 7;
  return addDays(iso, -offset);
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatDate(iso: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return fromISO(iso).toLocaleDateString(locale, options);
}
