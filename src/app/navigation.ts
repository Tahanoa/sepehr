/**
 * POLARIS NAVIGATION CONTROLLER
 * Tracks current active page titles and paths.
 */

export const ROUTE_TITLES: Record<string, string> = {
  '/': 'پیش‌خوان اصلی و سامانه طراحی',
  '/students': 'مدیریت دانش‌آموزان',
  '/courses': 'دوره‌های آموزشی',
  '/grades': 'کارنامه‌ها و ارزیابی',
  '/reports': 'گزارش‌های مدیریتی',
  '/settings': 'تنظیمات سامانه',
};

export function getTitleForPath(path: string): string {
  return ROUTE_TITLES[path] || 'صفحه اصلی';
}
