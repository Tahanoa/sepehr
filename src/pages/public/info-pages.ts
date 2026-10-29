/**
 * POLARIS ABOUT, LEGAL & 404 PAGES
 */

import { createElement } from '../../utils/dom';

export function createAboutPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16' });

  const hero = createElement('div', { className: 'text-center space-y-4 max-w-3xl mx-auto' });
  hero.innerHTML = `
    <span class="px-3 py-1 rounded-full bg-brand-amber/10 text-brand-amber dark:text-amber-400 text-xs font-bold">درباره سامانه پولاریس</span>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-brand-evergreen dark:text-teal-400">تسهیل و هوشمندسازی مدیریت آموزش</h1>
    <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
      پولاریس یک پلتفرم ابری مدرن است که با هدف رفع چالش‌های متعدد مدیران، معلمان و اولیا در فرایندهای آموزشی کشور توسعه یافته است.
    </p>
  `;
  container.appendChild(hero);

  const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' });
  grid.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      <h2 class="text-xl font-bold text-brand-evergreen dark:text-teal-300">مسئله‌ای که حل می‌کنیم</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        بسیاری از مدارس و موسسات آموزشی مجبورند از چندین سامانه مجزا برای حضور و غیاب، نمره‌دهی، پیامک، و مالی استفاده کنند. پولاریس تمام این نیازها را در یک بستر یکپارچه و هوشمند فراهم کرده است.
      </p>
    </div>
    <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      <h2 class="text-xl font-bold text-brand-evergreen dark:text-teal-300">رویکرد ماژولار پولاریس</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        نیازهای یک دبستان با یک دبیرستان کنکوری یا یک آموزشگاه زبان کاملاً متفاوت است. ساختار ماژولار پولاریس اجازه می‌دهد هر مرکز تنها ابزارهای مورد نیاز خود را فعال کند.
      </p>
    </div>
  `;
  container.appendChild(grid);

  return container;
}

export function createPrivacyPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white dark:bg-gray-800 my-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm' });
  container.innerHTML = `
    <div class="border-b border-gray-100 dark:border-gray-700 pb-4 space-y-2">
      <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">پیش‌نویس جهت بررسی حقوقی</span>
      <h1 class="text-3xl font-bold text-brand-evergreen dark:text-teal-400">سیاست حریم خصوصی پولاریس</h1>
    </div>
    <div class="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-brand-evergreen dark:text-teal-300">۱. گردآوری داده‌ها</h2>
        <p>اطلاعات ثبت‌شده توسط مدارس و موسسات آموزشی منحصراً جهت ارائه خدمات آموزشی و مدیریت امور کلاسی مورد استفاده قرار می‌گیرند.</p>
      </section>
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-brand-evergreen dark:text-teal-300">۲. حفاظت و امنیت اطلاعات</h2>
        <p>پولاریس از بالاترین استانداردهای رمزنگاری داده‌ها استفاده نموده و متعهد به عدم افشای اطلاعات دانش‌آموزان و موسسات به اشخاص ثالث است.</p>
      </section>
    </div>
  `;
  return container;
}

export function createTermsPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-white dark:bg-gray-800 my-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm' });
  container.innerHTML = `
    <div class="border-b border-gray-100 dark:border-gray-700 pb-4 space-y-2">
      <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">پیش‌نویس جهت بررسی حقوقی</span>
      <h1 class="text-3xl font-bold text-brand-evergreen dark:text-teal-400">شرایط و قوانین استفاده خدمات</h1>
    </div>
    <div class="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-brand-evergreen dark:text-teal-300">۱. مسئولیت حساب‌های کاربری</h2>
        <p>مدارس و آموزشگاه‌ها مسئول حفظ محرمانگی نام‌کاربری و کلمه‌عبور دسترسی‌های اعطا شده به کادر اجرایی، معلمان و دانش‌آموزان می‌باشند.</p>
      </section>
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-brand-evergreen dark:text-teal-300">۲. مالکیت معنوی</h2>
        <p>تمامی حقوق مادی و معنوی علامت تجاری، کدهای نرم‌افزاری و رابط کاربری پولاریس متعلق به مجموعه پولاریس می‌باشد.</p>
      </section>
    </div>
  `;
  return container;
}

export function createNotFoundPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6' });
  container.innerHTML = `
    <div class="w-24 h-24 mx-auto rounded-3xl bg-brand-lavender/60 dark:bg-gray-800 text-brand-evergreen dark:text-teal-400 flex items-center justify-center text-4xl font-extrabold">۴۰۴</div>
    <h1 class="text-3xl font-extrabold text-brand-evergreen dark:text-teal-400">صفحه مورد نظر یافت نشد</h1>
    <p class="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">صفحه‌ای که به دنبال آن هستید ممکن است تغییر نام داده شده یا وجود نداشته باشد.</p>
  `;

  const backHomeBtn = createElement('a', {
    attributes: { href: '/' },
    className: 'inline-block px-6 py-3 rounded-xl bg-brand-evergreen dark:bg-teal-700 text-white font-bold text-sm shadow hover:bg-brand-darkgreen dark:hover:bg-teal-600 transition-colors',
    textContent: 'بازگشت به صفحه اصلی',
  });
  backHomeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/' }));
  });
  container.appendChild(backHomeBtn);

  return container;
}
