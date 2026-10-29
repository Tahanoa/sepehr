/**
 * POLARIS PUBLIC FOOTER COMPONENT
 */

import { createElement } from '../../utils/dom';

export function createPublicFooter(): HTMLElement {
  const footer = createElement('footer', {
    className: 'bg-brand-evergreen text-white border-t border-brand-darkgreen pt-16 pb-12',
  });

  const container = createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  });

  const grid = createElement('div', {
    className: 'grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10',
  });

  // Column 1: Brand Info
  const col1 = createElement('div', { className: 'space-y-4 md:col-span-1' });
  const brandTitle = createElement('div', { className: 'flex items-center gap-3' });
  brandTitle.innerHTML = `
    <div class="w-10 h-10 rounded-xl bg-brand-amber flex items-center justify-center text-gray-900 font-bold text-xl shadow-md">
      <svg class="w-6 h-6 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
    </div>
    <span class="text-2xl font-semibold tracking-tight">سپهر</span>
  `;
  const brandDesc = createElement('p', {
    className: 'text-sm text-gray-300 leading-relaxed',
    textContent: 'پلتفرم جامع، هوشمند و ماژولار مدیریت مدارس ابتدایی، متوسطه و آموزشگاه‌های تخصصی کشور.',
  });
  col1.appendChild(brandTitle);
  col1.appendChild(brandDesc);

  // Column 2: Plans Quick Links
  const col2 = createElement('div', { className: 'space-y-3' });
  col2.innerHTML = `
    <h3 class="text-base font-bold text-brand-amber mb-4">طرح‌های آموزشی</h3>
    <ul class="space-y-2.5 text-sm text-gray-300">
      <li><a href="/plans/elementary" class="hover:text-white transition-colors polaris-link">طرح مدارس ابتدایی (۱-۶)</a></li>
      <li><a href="/plans/secondary" class="hover:text-white transition-colors polaris-link">طرح دبیرستان‌ها (۷-۱۲)</a></li>
      <li><a href="/plans/institute" class="hover:text-white transition-colors polaris-link">آموزشگاه‌های آزاد و زبان</a></li>
      <li><a href="/plans" class="hover:text-white transition-colors polaris-link">مقایسه کلی طرح‌ها</a></li>
    </ul>
  `;

  // Column 3: Navigation Links
  const col3 = createElement('div', { className: 'space-y-3' });
  col3.innerHTML = `
    <h3 class="text-base font-bold text-brand-amber mb-4">دسترسی سریع</h3>
    <ul class="space-y-2.5 text-sm text-gray-300">
      <li><a href="/about" class="hover:text-white transition-colors polaris-link">درباره سپهر</a></li>
      <li><a href="/contact" class="hover:text-white transition-colors polaris-link">ارتباط با ما</a></li>
      <li><a href="/register" class="hover:text-white transition-colors polaris-link">درخواست مشاوره و دمو</a></li>
      <li><a href="/login" class="hover:text-white transition-colors polaris-link">ورود به پنل کاربری</a></li>
    </ul>
  `;

  // Column 4: Legal & Contact
  const col4 = createElement('div', { className: 'space-y-3' });
  col4.innerHTML = `
    <h3 class="text-base font-bold text-brand-amber mb-4">قوانین و پشتیبانی</h3>
    <ul class="space-y-2.5 text-sm text-gray-300">
      <li><a href="/privacy" class="hover:text-white transition-colors polaris-link">حریم خصوصی</a></li>
      <li><a href="/terms" class="hover:text-white transition-colors polaris-link">شرایط و قوانین استفاده</a></li>
      <li class="pt-2 text-xs text-gray-400">پشتیبانی تلفنی و آنلاین در ساعات کاری</li>
    </ul>
  `;

  grid.appendChild(col1);
  grid.appendChild(col2);
  grid.appendChild(col3);
  grid.appendChild(col4);

  // Bottom Copyright
  const bottom = createElement('div', {
    className: 'pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4',
  });
  bottom.innerHTML = `
    <p>© ۱۴۰۳ سامانه نرم‌افزاری سپهر. تمامی حقوق محفوظ است.</p>
    <div class="flex gap-6">
      <a href="/privacy" class="hover:text-gray-200 polaris-link">حریم خصوصی</a>
      <a href="/terms" class="hover:text-gray-200 polaris-link">قوانین</a>
    </div>
  `;

  container.appendChild(grid);
  container.appendChild(bottom);
  footer.appendChild(container);

  // Attach navigation listeners for polaris-link
  footer.querySelectorAll('.polaris-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = (link as HTMLAnchorElement).getAttribute('href');
      if (path) {
        window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: path }));
      }
    });
  });

  return footer;
}
