/**
 * POLARIS FORMATTER UTILITIES
 * Persian digits formatting, Jalali/Persian date formatting, numbers, grades & currency formatters.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert digits in a string or number to Persian digits for display */
export function toPersianDigits(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)] || digit);
}

/** Convert Persian digits to Latin digits for data processing and form inputs */
export function toLatinDigits(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/[۰-۹]/g, (w) => String(PERSIAN_DIGITS.indexOf(w)));
}

/** Format numbers for Persian display with locale grouping */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '۰';
  return new Intl.NumberFormat('fa-IR').format(num);
}

/** Format currency with suffix */
export function formatCurrency(amount: number | null | undefined, currencySuffix = 'تومان'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return `۰ ${currencySuffix}`;
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ${currencySuffix}`;
}

/** Format percentage for display */
export function formatPercent(percent: number | null | undefined): string {
  if (percent === null || percent === undefined || isNaN(percent)) return '۰٪';
  const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(percent);
  return `%${formatted}`;
}

/** Format academic grades out of 20 or custom max */
export function formatGrade(score: number | null | undefined, maxScore: number = 20): string {
  if (score === null || score === undefined || isNaN(score)) return '-';
  const scoreFormatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(score);
  const maxFormatted = new Intl.NumberFormat('fa-IR').format(maxScore);
  return `${scoreFormatted} از ${maxFormatted}`;
}

/** Format Jalali / Persian date representation */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  options: { includeTime?: boolean } = {}
): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (options.includeTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('fa-IR', dateOptions).format(d);
  } catch {
    return String(dateInput);
  }
}

/** Translate status string to standard Persian status label */
export function formatStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'فعال';
    case 'pending':
      return 'در انتظار';
    case 'inactive':
      return 'غیرفعال';
    case 'suspended':
      return 'معلق';
    case 'completed':
      return 'تکمیل شده';
    case 'failed':
      return 'ناموفق';
    case 'approved':
      return 'تایید شده';
    case 'rejected':
      return 'رد شده';
    default:
      return status;
  }
}
