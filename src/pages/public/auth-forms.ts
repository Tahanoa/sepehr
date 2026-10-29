/**
 * POLARIS FORMS: CONTACT, LOGIN, REGISTER & FORGOT PASSWORD
 */

import { createElement } from '../../utils/dom';
import { createDemoSwitcherModal } from '../../components/dashboard/demo-switcher-modal';

export function createContactPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8' });

  const header = createElement('div', { className: 'text-center space-y-3' });
  header.innerHTML = `
    <h1 class="text-3xl font-extrabold text-brand-evergreen dark:text-teal-400">تماس با کارشناسان پولاریس</h1>
    <p class="text-gray-600 dark:text-gray-300 text-sm">جهت دریافت راهنمایی، پاسخ به پرسش‌ها یا هماهنگی جلسه دمو با ما در ارتباط باشید.</p>
  `;
  container.appendChild(header);

  const formCard = createElement('div', { className: 'bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6' });

  const feedbackArea = createElement('div', { className: 'hidden p-4 rounded-xl text-xs font-bold' });
  formCard.appendChild(feedbackArea);

  const form = createElement('form', { className: 'space-y-4' });
  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">نام و نام خانوادگی <span class="text-red-500">*</span></label>
        <input type="text" name="name" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="مثال: علی محمدی">
      </div>
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">نام موسسه / مدرسه <span class="text-red-500">*</span></label>
        <input type="text" name="orgName" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="مثال: دبستان خرد">
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">ایمیل ارتباطی <span class="text-red-500">*</span></label>
        <input type="email" name="email" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="info@example.com">
      </div>
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">شماره تماس <span class="text-red-500">*</span></label>
        <input type="tel" name="phone" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="۰۹۱۲۰۰۰۰۰۰۰">
      </div>
    </div>
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">موضوع پیام <span class="text-red-500">*</span></label>
      <select name="subject" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber">
        <option value="general">مشاوره عمومی و دمو</option>
        <option value="sales">استعلام قیمت و خرید</option>
        <option value="support">پشتیبانی فنی</option>
      </select>
    </div>
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">متن پیام <span class="text-red-500">*</span></label>
      <textarea name="message" rows="4" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="پیام خود را بنویسید..."></textarea>
    </div>
    <button type="submit" class="w-full py-3.5 rounded-xl bg-brand-evergreen dark:bg-teal-700 hover:bg-brand-darkgreen dark:hover:bg-teal-600 text-white font-bold text-sm shadow transition-colors flex justify-center items-center gap-2">
      <span class="btn-text">ارسال پیام</span>
    </button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btnText = form.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'در حال ارسال پیام (دمو)...';

    setTimeout(() => {
      feedbackArea.className = 'p-4 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 block';
      feedbackArea.textContent = 'دمو: فرم تماس با موفقیت ثبت شد (توجه: در این نسخه آزمایشی پیامی ارسال نمی‌شود).';
      if (btnText) btnText.textContent = 'ارسال پیام';
      form.reset();
    }, 600);
  });

  formCard.appendChild(form);
  container.appendChild(formCard);
  return container;
}

export function createLoginPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-md mx-auto px-4 py-12 space-y-6' });

  // Demo Switcher Banner Card
  const demoCard = createElement('div', {
    className: 'bg-gradient-to-br from-[#012622] to-[#003B36] text-white p-6 rounded-3xl shadow-lg border border-[#E98A15]/30 space-y-3 dir-rtl text-right',
  });
  demoCard.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="px-2.5 py-1 bg-[#E98A15] text-[#012622] text-[10px] font-bold rounded-lg">ورود سریع آزمایشی</span>
      <span class="text-xs text-amber-200">۱۴ نقش آزمایشی فعال</span>
    </div>
    <h2 class="text-base font-extrabold text-white">ورود مستقیم به دمو سامانه</h2>
    <p class="text-xs text-gray-300 leading-relaxed">
      بدون نیاز به رمز عبور، نقش آزمایشی مورد نظر خود (مدیر، دبیر، دانش‌آموز، والدین، مشاور یا متقاضی) را در هر ۳ طرح انتخاب و بررسی کنید.
    </p>
  `;
  const enterDemoBtn = createElement('button', {
    className: 'w-full py-3 bg-[#E98A15] hover:bg-amber-600 text-[#012622] font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-300',
    textContent: 'مشاهده و انتخاب نقش‌های دمو',
  });
  enterDemoBtn.addEventListener('click', () => {
    const modal = createDemoSwitcherModal(() => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    });
    document.body.appendChild(modal);
  });
  demoCard.appendChild(enterDemoBtn);

  const card = createElement('div', { className: 'bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg space-y-6' });
  card.innerHTML = `
    <div class="text-center space-y-2">
      <div class="w-12 h-12 rounded-2xl bg-brand-evergreen dark:bg-teal-700 text-white flex items-center justify-center mx-auto text-xl font-bold shadow-md">
        <svg class="w-7 h-7 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
      </div>
      <h1 class="text-2xl font-extrabold text-brand-evergreen dark:text-teal-400">ورود با حساب کاربری</h1>
      <p class="text-xs text-gray-500 dark:text-gray-400">حساب کاربری مدرسه یا آموزشگاه خود را وارد نمایید</p>
    </div>
  `;

  const feedbackArea = createElement('div', { className: 'hidden p-3 rounded-xl text-xs font-bold' });
  card.appendChild(feedbackArea);

  const form = createElement('form', { className: 'space-y-4' });
  form.innerHTML = `
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">پست الکترونیک یا نام کاربری</label>
      <input type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="user@example.com">
    </div>
    <div class="space-y-1 text-right">
      <div class="flex justify-between items-center">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">کلمه عبور</label>
        <a href="/forgot-password" class="polaris-forgot-link text-xs text-brand-amber dark:text-amber-400 hover:underline">فراموشی کلمه عبور؟</a>
      </div>
      <div class="relative">
        <input type="password" id="login-pass" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="••••••••">
        <button type="button" id="toggle-pass" class="absolute left-3 top-2.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">نمایش</button>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <input type="checkbox" id="remember" class="rounded border-gray-300 dark:border-gray-600 text-brand-amber focus:ring-brand-amber">
      <label for="remember" class="text-xs text-gray-600 dark:text-gray-400">مرا به خاطر بسپار</label>
    </div>
    <button type="submit" class="w-full py-3 rounded-xl bg-brand-evergreen dark:bg-teal-700 hover:bg-brand-darkgreen dark:hover:bg-teal-600 text-white font-bold text-sm shadow transition-colors">
      ورود به سامانه
    </button>
  `;

  const passInput = form.querySelector('#login-pass') as HTMLInputElement;
  const toggleBtn = form.querySelector('#toggle-pass') as HTMLButtonElement;
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      toggleBtn.textContent = isPass ? 'مخفی' : 'نمایش';
    });
  }

  const forgotLink = form.querySelector('.polaris-forgot-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/forgot-password' }));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedbackArea.className = 'p-3 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 block text-center';
    feedbackArea.textContent = 'دمو: جهت ورود واقعی نیاز به اتصال به بک‌اند احراز هویت می‌باشد.';
  });

  card.appendChild(form);
  container.appendChild(demoCard);
  container.appendChild(card);
  return container;
}

export function createRegisterPage(preselectedPlanId?: string): HTMLElement {
  const container = createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12 space-y-8' });

  const card = createElement('div', { className: 'bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md space-y-6' });
  card.innerHTML = `
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-extrabold text-brand-evergreen dark:text-teal-400">درخواست راه اندازی و مشاوره موسسه</h1>
      <p class="text-xs text-gray-600 dark:text-gray-400">پس از تکمیل فرم، کارشناسان پولاریس جهت ارائه مشاوره تخصصی با شما تماس خواهند گرفت.</p>
    </div>
  `;

  const feedbackArea = createElement('div', { className: 'hidden p-4 rounded-xl text-xs font-bold' });
  card.appendChild(feedbackArea);

  const form = createElement('form', { className: 'space-y-4' });
  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">نام موسسه / مدرسه <span class="text-red-500">*</span></label>
        <input type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber">
      </div>
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">طرح مورد نظر <span class="text-red-500">*</span></label>
        <select name="plan" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber">
          <option value="elementary" ${preselectedPlanId === 'elementary' ? 'selected' : ''}>طرح مدارس ابتدایی (۱-۶)</option>
          <option value="secondary" ${preselectedPlanId === 'secondary' ? 'selected' : ''}>طرح مدارس متوسطه (۷-۱۲)</option>
          <option value="institute" ${preselectedPlanId === 'institute' ? 'selected' : ''}>طرح آموزشگاه‌های آزاد و زبان</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">نام رابط / مسئول <span class="text-red-500">*</span></label>
        <input type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber">
      </div>
      <div class="space-y-1 text-right">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">شماره تلفن همراه <span class="text-red-500">*</span></label>
        <input type="tel" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="۰۹۱۲۰۰۰۰۰۰۰">
      </div>
    </div>
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">توضیحات تکمیلی (اختیاری)</label>
      <textarea rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber"></textarea>
    </div>
    <div class="flex items-center gap-2">
      <input type="checkbox" required id="terms-check" class="rounded border-gray-300 dark:border-gray-600 text-brand-amber focus:ring-brand-amber">
      <label for="terms-check" class="text-xs text-gray-600 dark:text-gray-400">با <a href="/terms" class="polaris-terms-link text-brand-amber dark:text-amber-400 underline">قوانین و حریم خصوصی</a> موافقم.</label>
    </div>
    <button type="submit" class="w-full py-3.5 rounded-xl bg-brand-amber hover:bg-amber-600 text-white font-bold text-sm shadow transition-colors">
      ثبت درخواست مشاوره
    </button>
  `;

  const termsLink = form.querySelector('.polaris-terms-link');
  if (termsLink) {
    termsLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/terms' }));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedbackArea.className = 'p-4 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 block text-center';
    feedbackArea.textContent = 'دمو: درخواست استعلام سازمان با موفقیت ثبت شد (ایجاد حساب کاربری واقعی نیازمند تایید کارشناس است).';
  });

  card.appendChild(form);
  container.appendChild(card);
  return container;
}

export function createForgotPasswordPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-md mx-auto px-4 py-16 space-y-8' });

  const card = createElement('div', { className: 'bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md space-y-6' });
  card.innerHTML = `
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-extrabold text-brand-evergreen dark:text-teal-400">بازیابی کلمه عبور</h1>
      <p class="text-xs text-gray-500 dark:text-gray-400">ایمیل ثبت‌شده در سامانه را وارد نمایید</p>
    </div>
  `;

  const feedbackArea = createElement('div', { className: 'hidden p-3 rounded-xl text-xs font-bold' });
  card.appendChild(feedbackArea);

  const form = createElement('form', { className: 'space-y-4' });
  form.innerHTML = `
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">پست الکترونیک ثبت شده</label>
      <input type="email" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-amber focus:ring-1 focus:ring-brand-amber" placeholder="user@example.com">
    </div>
    <button type="submit" class="w-full py-3 rounded-xl bg-brand-evergreen dark:bg-teal-700 hover:bg-brand-darkgreen dark:hover:bg-teal-600 text-white font-bold text-sm shadow transition-colors">
      ارسال لینک بازیابی
    </button>
    <div class="text-center pt-2">
      <a href="/login" class="polaris-back-login text-xs text-gray-500 dark:text-gray-400 hover:text-brand-evergreen dark:hover:text-teal-300">بازگشت به صفحه ورود</a>
    </div>
  `;

  const backLogin = form.querySelector('.polaris-back-login');
  if (backLogin) {
    backLogin.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/login' }));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedbackArea.className = 'p-3 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 block text-center';
    feedbackArea.textContent = 'در صورت وجود ایمیل وارد شده در سیستم، دستورالعمل بازیابی ارسال گردید (دمو).';
  });

  card.appendChild(form);
  container.appendChild(card);
  return container;
}
