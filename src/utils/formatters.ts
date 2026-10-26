/**
 * POLARIS FORMATTER UTILITIES
 * Persian digits formatting, Jalali date formatting, numbers & currency formatters.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatNumber(num: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(num);
  return formatted;
}

export function formatCurrency(amount: number, currencySuffix = 'تومان'): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ${currencySuffix}`;
}

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
    default:
      return status;
  }
}
