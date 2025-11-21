type DateInput = string | number | Date;

const toDate = (dateInput: DateInput): Date | null => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatShortDate = (
  dateInput: DateInput,
  locale = 'en-US'
): string => {
  const date = toDate(dateInput);
  return date
    ? date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
};

export const formatMonthYear = (dateInput: DateInput, locale = 'en-US'): string => {
  const date = toDate(dateInput);
  return date ? date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : '';
};

