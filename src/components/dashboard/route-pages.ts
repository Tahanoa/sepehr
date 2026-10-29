/**
 * POLARIS ROUTE EXCEPTION PAGES
 * Access Denied, Feature Placeholder, and Dashboard Not Found pages.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon, getRoleLabel } from './icons';

export interface FeaturePlaceholderOptions {
  sectionTitle: string;
  sectionKey: string;
  roleTitle?: string;
  organizationId: string;
}

export function createFeaturePlaceholderPage(options: FeaturePlaceholderOptions): HTMLElement {
  const { sectionTitle, roleTitle, organizationId } = options;

  const container = createElement('div', {
    className:
      'max-w-3xl mx-auto my-4 sm:my-8 bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-12 shadow-2xs text-center flex flex-col items-center justify-center min-h-[380px] dir-rtl animate-pop-in',
  });

  const iconWrapper = createElement('div', {
    className: 'p-4 rounded-2xl bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] mb-5 shadow-2xs',
    innerHTML: getDashboardIcon('info', 'w-10 h-10 sm:w-12 sm:h-12'),
  });

  const badge = createElement('span', {
    className:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/90 mb-3',
    textContent: '🚧 ماژول در حال توسعه و آماده‌سازی',
  });

  const title = createElement('h2', {
    className: 'text-xl sm:text-2xl font-bold text-[rgb(var(--theme-primary))] mb-2.5 tracking-tight',
    textContent: sectionTitle,
  });

  const desc = createElement('p', {
    className: 'text-xs sm:text-sm text-gray-600 max-w-lg leading-relaxed mb-6 font-normal',
    textContent: `زیرساخت اختصاصی بخش «${sectionTitle}» برای نقش ${
      roleTitle ? `«${roleTitle}»` : ''
    } تعریف شده و زیرسامانه‌های عملیاتی آن در فاز بعدی سامانه سپهر فعال خواهند شد.`,
  });

  const infoBox = createElement('div', {
    className:
      'bg-gray-50/80 border border-gray-200/70 rounded-xl p-4 max-w-md w-full mb-6 text-right text-xs text-gray-600 space-y-2 shadow-2xs',
  });

  infoBox.innerHTML = `
    <div class="flex items-center justify-between border-b border-gray-200/60 pb-2">
      <span class="font-bold text-gray-700">شناسه بخش:</span>
      <span class="font-mono text-gray-900 bg-gray-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">${options.sectionKey}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-bold text-gray-700">وضعیت دسترسی:</span>
      <span class="text-emerald-800 font-bold flex items-center gap-1">✓ احراز هویت شده</span>
    </div>
  `;

  const btnContainer = createElement('div', { className: 'flex items-center justify-center gap-3 flex-wrap' });

  const overviewBtn = createElement('a', {
    className:
      'inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] min-h-[44px]',
    attributes: { href: `/app/${organizationId}/overview` },
  });
  overviewBtn.innerHTML = `${getDashboardIcon('dashboard', 'w-4 h-4')} بازگشت به پیش‌خوان اصلی`;
  overviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${organizationId}/overview` }));
  });

  btnContainer.appendChild(overviewBtn);

  container.appendChild(iconWrapper);
  container.appendChild(badge);
  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(infoBox);
  container.appendChild(btnContainer);

  return container;
}

export function createAccessDeniedPage(organizationId: string, userRole?: string): HTMLElement {
  const container = createElement('div', {
    className:
      'max-w-3xl mx-auto my-8 bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px] dir-rtl',
  });

  const iconWrapper = createElement('div', {
    className: 'p-4 rounded-2xl bg-rose-100 text-rose-700 mb-6',
    innerHTML: getDashboardIcon('lock', 'w-12 h-12'),
  });

  const title = createElement('h2', {
    className: 'text-2xl font-semibold text-gray-900 mb-2',
    textContent: 'عدم سطح دسترسی کافی (۴۰۳)',
  });

  const desc = createElement('p', {
    className: 'text-sm text-gray-600 max-w-md leading-relaxed mb-6',
    textContent: `نقش فعلی شما (${
      userRole ? getRoleLabel(userRole) : 'کاربر جاری'
    }) مجوز مشاهده یا ویرایش اطلاعات این بخش را ندارد.`,
  });

  const overviewBtn = createElement('a', {
    className:
      'inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--theme-primary))] text-white text-xs font-bold rounded-xl hover:bg-[rgb(var(--theme-hover))] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    attributes: { href: `/app/${organizationId}/overview` },
  });
  overviewBtn.innerHTML = `${getDashboardIcon('dashboard', 'w-4 h-4')} بازگشت به پیش‌خوان مجاز`;
  overviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${organizationId}/overview` }));
  });

  container.appendChild(iconWrapper);
  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(overviewBtn);

  return container;
}

export function createDashboardNotFoundPage(organizationId: string): HTMLElement {
  const container = createElement('div', {
    className:
      'max-w-3xl mx-auto my-8 bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px] dir-rtl',
  });

  const iconWrapper = createElement('div', {
    className: 'p-4 rounded-2xl bg-gray-100 text-gray-600 mb-6',
    innerHTML: getDashboardIcon('info', 'w-12 h-12'),
  });

  const title = createElement('h2', {
    className: 'text-2xl font-semibold text-gray-900 mb-2',
    textContent: 'صفحه مورد نظر در پنل کاربری یافت نشد (۴۰۴)',
  });

  const desc = createElement('p', {
    className: 'text-sm text-gray-600 max-w-md leading-relaxed mb-6',
    textContent: 'آدرس وارد شده معتبر نیست یا به بخش دیگری انتقال یافته است.',
  });

  const overviewBtn = createElement('a', {
    className:
      'inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--theme-primary))] text-white text-xs font-bold rounded-xl hover:bg-[rgb(var(--theme-hover))] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    attributes: { href: `/app/${organizationId}/overview` },
  });
  overviewBtn.innerHTML = `${getDashboardIcon('dashboard', 'w-4 h-4')} بازگشت به پیش‌خوان`;
  overviewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${organizationId}/overview` }));
  });

  container.appendChild(iconWrapper);
  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(overviewBtn);

  return container;
}
