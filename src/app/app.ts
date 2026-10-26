/**
 * POLARIS APPLICATION INITIALIZER
 * Initializes AppShell, Router, and global event bindings.
 */

import { AppShell } from '../components/app-shell';
import { Router } from './router';
import { getTitleForPath } from './navigation';
import { createHomePage, createGenericPage } from '../pages/home/home-page';

export function initializeApp(): AppShell {
  const appShell = new AppShell();
  const router = new Router();

  // Register routes
  router.addRoute('/', () => createHomePage());
  router.addRoute('/students', () =>
    createGenericPage('مدیریت دانش‌آموزان', 'ماژول کامل مدیریت دانش‌آموزان در گام‌های بعدی پیاده‌سازی خواهد شد.')
  );
  router.addRoute('/courses', () =>
    createGenericPage('دوره‌های آموزشی', 'مدیریت کلاس‌ها و دوره‌های آموزشی پولاریس.')
  );
  router.addRoute('/grades', () =>
    createGenericPage('کارنامه‌ها و نمرات', 'سیستم ثبت و مشاهده کارنامه‌های دانش‌آموزی.')
  );
  router.addRoute('/reports', () =>
    createGenericPage('گزارش‌های تحلیلی', 'گزارش‌های جامع عملکرد آموزشی و هوش سازمانی.')
  );
  router.addRoute('/settings', () =>
    createGenericPage('تنظیمات سیستم', 'تنظیمات عمومی سامانه پولاریس و سطح دسترسی‌ها.')
  );

  // Router listener
  router.onRoute((path, content) => {
    appShell.setActivePath(path);
    appShell.setContent(content, getTitleForPath(path));
  });

  // Navigation handlers
  appShell.setOnNavigate((path) => {
    router.navigate(path);
  });

  window.addEventListener('polaris-navigate', ((e: CustomEvent) => {
    if (e.detail) {
      router.navigate(e.detail);
    }
  }) as EventListener);

  // Initial load
  router.navigate('/');

  return appShell;
}
