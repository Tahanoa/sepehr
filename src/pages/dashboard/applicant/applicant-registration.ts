/**
 * POLARIS PROSPECTIVE APPLICANT ONLINE REGISTRATION WIZARD
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { showToast } from '../../../components/toast';

export function createApplicantRegistrationPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const classes = schoolStore.getClasses(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('assignment', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} ثبت‌نام آنلاین و درخواست پذیرش
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">تکمیل مشخصات فردی، انتخاب دوره آموزشی و صدور کد رهگیری پذیرش.</p>
    `;

    const formCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4' });

    const form = createElement('form', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی متقاضی *</label>
          <input type="text" id="app-name" required value="مریم صبوری" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
        <div>
          <label class="block font-bold mb-1">کد ملی *</label>
          <input type="text" id="app-nid" required value="۰۰۲۴۵۱۸۹۷۲" maxlength="10" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">شماره تلفن همراه *</label>
          <input type="tel" id="app-phone" required value="۰۹۱۲۳۳۳۲۲۱۱" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
        <div>
          <label class="block font-bold mb-1">پست الکترونیکی</label>
          <input type="email" id="app-email" value="m.sabouri@gmail.com" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">انتخاب دوره آموزشی *</label>
          <select id="app-course" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[rgb(var(--theme-accent))]">
            ${classes.map((c) => `<option value="${c.id}">${c.name} (${c.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">شهریه اولیه دوره</label>
          <input type="text" readonly value="۴,۵۰۰,۰۰۰ تومان" class="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-[rgb(var(--theme-primary))]" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">توضیحات و ترجیحات زمانی کلاس</label>
        <textarea id="app-notes" rows="3" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="مثال: ترجیحاً کلاس‌های نوبت عصر پنج‌شنبه..."></textarea>
      </div>

      <button type="submit" class="w-full py-3 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2">
        <span>ثبت نهایی درخواست و دریافت کد رهگیری</span>
      </button>
    `;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const applicantName = (form.querySelector('#app-name') as HTMLInputElement).value.trim();
      const applicantPhone = (form.querySelector('#app-phone') as HTMLInputElement).value.trim();
      const applicantEmail = (form.querySelector('#app-email') as HTMLInputElement).value.trim();
      const nationalId = (form.querySelector('#app-nid') as HTMLInputElement).value.trim();
      const courseId = (form.querySelector('#app-course') as HTMLSelectElement).value;
      const notes = (form.querySelector('#app-notes') as HTMLTextAreaElement).value.trim();

      const selectedClass = classes.find((c) => c.id === courseId) || classes[0]!;

      const app = schoolStore.addApplication({
        organizationId: orgId,
        applicantName,
        applicantPhone,
        applicantEmail,
        nationalId,
        courseId: selectedClass.id,
        courseName: selectedClass.name,
        className: selectedClass.name,
        tuitionFee: 4500000,
        isPaid: false,
        notes,
      });

      showToast({ title: 'ثبت درخواست موفق', message: `درخواست ثبت‌نام با کد رهگیری ${app.refCode} صادر گردید.`, type: 'success' });
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/status` }));
    });

    formCard.appendChild(form);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(formCard);
  };

  render();
  return rootWrapper;
}
