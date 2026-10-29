/**
 * POLARIS HOME / LANDING PAGE VIEW
 */

import { createElement } from '../../utils/dom';
import { EDUCATIONAL_PLANS, PLATFORM_BENEFITS, GENERAL_FAQS } from '../../data/public-data';
import { createPlanCard, createFaqAccordion } from '../../components/public/public-cards';

export function createLandingPage(): HTMLElement {
  const container = createElement('div', { className: 'space-y-20 pb-20' });

  // 1. HERO SECTION
  const hero = createElement('section', {
    className: 'relative overflow-hidden bg-gradient-to-b from-brand-lavender/40 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 pt-12 pb-20 lg:pt-20 lg:pb-32 transition-colors',
  });

  const heroInner = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' });
  const heroGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-12 items-center' });

  // Hero Left / Content
  const heroText = createElement('div', { className: 'lg:col-span-6 space-y-6 text-right' });
  heroText.innerHTML = `
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-amber/10 border border-brand-amber/20 text-brand-amber dark:text-amber-400 text-xs font-bold">
      <span class="w-2 h-2 rounded-full bg-brand-amber animate-pulse"></span>
      نسخه جدید سامانه مدیریت هوشمند آموزش پولاریس
    </div>
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-evergreen dark:text-gray-100 leading-[1.3] tracking-tight">
      یکپارچگی و هوشمندی در <span class="text-brand-amber">مدیریت مدارس</span> و آموزشگاه‌ها
    </h1>
    <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
      پولاریس یک راهکار نرم‌افزاری ابری و ماژولار است که ارتباط میان دانش‌آموزان، معلمان، اولیا و کادر اجرایی مدارس ابتدایی، دبیرستان‌ها و موسسات آموزشی را ساده و بی‌نقص می‌سازد.
    </p>
  `;

  const heroBtns = createElement('div', { className: 'flex flex-wrap gap-4 pt-2' });

  const primaryCta = createElement('a', {
    attributes: { href: '/register' },
    className: 'px-7 py-3.5 rounded-xl bg-brand-amber hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-brand-amber/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5',
    textContent: 'درخواست مشاوره و ثبت‌نام',
  });
  primaryCta.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/register' }));
  });

  const secondaryCta = createElement('a', {
    attributes: { href: '/plans' },
    className: 'px-7 py-3.5 rounded-xl border-2 border-brand-evergreen dark:border-teal-500 text-brand-evergreen dark:text-teal-400 hover:bg-brand-evergreen dark:hover:bg-teal-600 hover:text-white dark:hover:text-white font-bold text-sm transition-all',
    textContent: 'بررسی طرح‌های آموزشی',
  });
  secondaryCta.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/plans' }));
  });

  heroBtns.appendChild(primaryCta);
  heroBtns.appendChild(secondaryCta);
  heroText.appendChild(heroBtns);

  // Hero Right / Believable Dashboard Preview
  const heroPreview = createElement('div', { className: 'lg:col-span-6' });
  heroPreview.innerHTML = `
    <div class="relative mx-auto max-w-xl lg:max-w-none">
      <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-amber to-brand-purple opacity-30 blur-2xl"></div>
      <div class="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-2xl space-y-4">
        <!-- Mock App Topbar -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-amber-400"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">پیش‌خوان مدیریت پولاریس</span>
        </div>
        <!-- Mock Metric Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl text-center border border-gray-100 dark:border-gray-700">
            <span class="text-xs text-gray-500 dark:text-gray-400 block">دانش‌آموزان</span>
            <span class="text-lg font-bold text-brand-evergreen dark:text-teal-400">۴۸۵</span>
          </div>
          <div class="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl text-center border border-amber-100 dark:border-amber-900/60">
            <span class="text-xs text-amber-700 dark:text-amber-300 block">کلاس فعال</span>
            <span class="text-lg font-bold text-brand-amber">۱۸</span>
          </div>
          <div class="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl text-center border border-purple-100 dark:border-purple-900/60">
            <span class="text-xs text-purple-700 dark:text-purple-300 block">حضور امروز</span>
            <span class="text-lg font-bold text-brand-purple dark:text-purple-300 font-mono">۹۸.۲٪</span>
          </div>
        </div>
        <!-- Mock Chart & Activity -->
        <div class="space-y-2 pt-2">
          <div class="text-xs font-bold text-gray-700 dark:text-gray-300">وضعیت ارزیابی ترم جاری</div>
          <div class="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div class="w-3/5 bg-brand-evergreen dark:bg-teal-500 h-full"></div>
            <div class="w-1/4 bg-brand-amber h-full"></div>
            <div class="w-3/20 bg-brand-purple h-full"></div>
          </div>
          <div class="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-1">
            <span>تکمیل شده (۶۰٪)</span>
            <span>در حال اقدام (۲۵٪)</span>
            <span>باقیمانده (۱۵٪)</span>
          </div>
        </div>
      </div>
    </div>
  `;

  heroGrid.appendChild(heroText);
  heroGrid.appendChild(heroPreview);
  heroInner.appendChild(heroGrid);
  hero.appendChild(heroInner);
  container.appendChild(hero);

  // 2. PLATFORM BENEFITS
  const benefitsSec = createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' });
  benefitsSec.innerHTML = `
    <div class="text-center space-y-3 mb-12">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-brand-evergreen dark:text-teal-400">مزایای کلیدی پلتفرم پولاریس</h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">طراحی بر پایه استانداردهای آموزشی کشور با تاکید بر سادگی، سرعت و انعطاف‌پذیری موسسات.</p>
    </div>
  `;

  const benefitsGrid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' });
  PLATFORM_BENEFITS.forEach((b) => {
    const card = createElement('div', {
      className: 'bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow space-y-3 text-right',
    });
    card.innerHTML = `
      <div class="w-12 h-12 rounded-xl bg-brand-lavender/60 dark:bg-gray-700 text-brand-evergreen dark:text-teal-300 flex items-center justify-center font-bold text-xl">
        <svg class="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">${b.title}</h3>
      <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">${b.description}</p>
    `;
    benefitsGrid.appendChild(card);
  });
  benefitsSec.appendChild(benefitsGrid);
  container.appendChild(benefitsSec);

  // 3. THREE EDUCATIONAL PLAN CARDS
  const plansSec = createElement('section', { className: 'bg-gray-50 dark:bg-gray-900/50 py-16 border-y border-gray-200 dark:border-gray-800' });
  const plansInner = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10' });
  plansInner.innerHTML = `
    <div class="text-center space-y-3">
      <span class="text-xs font-bold text-brand-amber uppercase tracking-wider">طرح‌های تخصصی</span>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-brand-evergreen dark:text-teal-400">انتخاب طرح متناسب با ساختار آموزشی شما</h2>
    </div>
  `;

  const plansGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' });
  Object.values(EDUCATIONAL_PLANS).forEach((plan) => {
    plansGrid.appendChild(createPlanCard(plan));
  });
  plansInner.appendChild(plansGrid);
  plansSec.appendChild(plansInner);
  container.appendChild(plansSec);

  // 4. FAQ SECTION
  const faqSec = createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8' });
  faqSec.innerHTML = `
    <div class="text-center space-y-3">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-brand-evergreen dark:text-teal-400">پرسش‌های متداول</h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm">پاسخ به برخی از سوالات رایج مدیران و مسئولان آموزشی</p>
    </div>
  `;
  faqSec.appendChild(createFaqAccordion(GENERAL_FAQS));
  container.appendChild(faqSec);

  // 5. FINAL CTA
  const ctaSec = createElement('section', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' });
  const ctaBox = createElement('div', {
    className: 'bg-gradient-to-r from-brand-evergreen via-brand-darkgreen to-brand-purple rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden',
  });
  ctaBox.innerHTML = `
    <h2 class="text-2xl sm:text-4xl font-extrabold">آماده ارتقای سامانه آموزشی خود هستید؟</h2>
    <p class="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto">
      همین امروز فرم درخواست مشاوره را تکمیل کنید تا کارشناسان ما جهت ارائه نسخه دمو و بررسی نیازهای دقیق مدرسه یا آموزشگاه شما تماس بگیرند.
    </p>
  `;
  const ctaBtn = createElement('a', {
    attributes: { href: '/register' },
    className: 'inline-block px-8 py-4 rounded-xl bg-brand-amber hover:bg-amber-600 text-white font-extrabold text-base shadow-lg transition-transform transform hover:scale-105',
    textContent: 'ثبت درخواست مشاوره رایگان',
  });
  ctaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/register' }));
  });
  ctaBox.appendChild(ctaBtn);
  ctaSec.appendChild(ctaBox);
  container.appendChild(ctaSec);

  return container;
}
