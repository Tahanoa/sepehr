import { createThemePanel } from '../../../theme/theme-panel';
/**
 * POLARIS SCHOOL SETTINGS PAGE
 * Editable school profile, academic year configuration, parent messaging settings,
 * local storage persistence, and "Reset Demo Data" option.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createSettingsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const render = () => {
    rootWrapper.innerHTML = '';

    const settings = schoolStore.getSettings(orgId);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('settings', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} تنظیمات و اطلاعات مرکز آموزشی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `پیکربندی مشخصات عمومی مدرسه، سال تحصیلی جاری، تنظیمات پیام‌رسانی اولیا و بازنشانی داده‌های آزمایشی.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    headerRow.appendChild(headerText);

    // Settings Form Box
    const formCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-6' });

    const form = createElement('form', { className: 'space-y-4 text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">نام رسمی مرکز آموزشی *</label>
          <input type="text" id="set-schoolName" value="${settings.schoolName}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
        <div>
          <label class="block font-bold mb-1">نام مدیر/سرپرست مرکز *</label>
          <input type="text" id="set-principalName" value="${settings.principalName}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">شماره تلفن واحد اداری *</label>
          <input type="text" id="set-phone" value="${settings.phone}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
        <div>
          <label class="block font-bold mb-1">سال تحصیلی جاری *</label>
          <input type="text" id="set-academicYear" value="${settings.academicYear}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">آدرس پستی مرکز</label>
        <input type="text" id="set-address" value="${settings.address}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" />
      </div>

      <div class="pt-4 border-t border-gray-200 space-y-3">
        <h3 class="font-semibold text-sm text-gray-900">تنظیمات ارتباطات و اطلاع‌رسانی</h3>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="set-parentMessaging" ${settings.allowParentMessaging ? 'checked' : ''} class="w-4 h-4 rounded text-[rgb(var(--theme-primary))]" />
          <label for="set-parentMessaging" class="font-semibold text-gray-800 cursor-pointer">امکان ارسال و دریافت پیام مستقیم اولیا فعال باشد</label>
        </div>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="set-autoAlerts" ${settings.autoAttendanceAlerts ? 'checked' : ''} class="w-4 h-4 rounded text-[rgb(var(--theme-primary))]" />
          <label for="set-autoAlerts" class="font-semibold text-gray-800 cursor-pointer">هشدار خودکار غیبت غیرمجاز به اولیا صادر شود</label>
        </div>
      </div>
    `;

    const saveBtn = createElement('button', {
      className:
        'px-5 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      textContent: 'ذخیره و اعمال تنظیمات',
    });

    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const schoolName = (form.querySelector('#set-schoolName') as HTMLInputElement).value.trim();
      const principalName = (form.querySelector('#set-principalName') as HTMLInputElement).value.trim();
      const phone = (form.querySelector('#set-phone') as HTMLInputElement).value.trim();
      const academicYear = (form.querySelector('#set-academicYear') as HTMLInputElement).value.trim();
      const address = (form.querySelector('#set-address') as HTMLInputElement).value.trim();
      const allowParentMessaging = (form.querySelector('#set-parentMessaging') as HTMLInputElement).checked;
      const autoAttendanceAlerts = (form.querySelector('#set-autoAlerts') as HTMLInputElement).checked;

      schoolStore.updateSettings(orgId, {
        schoolName,
        principalName,
        phone,
        academicYear,
        address,
        allowParentMessaging,
        autoAttendanceAlerts,
      });

      showToast({ title: 'تنظیمات ذخیره شد', message: 'اطلاعات مرکز با موفقیت بروزرسانی گردید.', type: 'success' });
      render();
    });

    formCard.appendChild(form);
    formCard.appendChild(saveBtn);

    // Reset Demo Data Section
    const resetCard = createElement('div', {
      className: 'bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3 dir-rtl',
    });

    resetCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h3 class="font-semibold text-sm text-rose-950 flex items-center gap-2">
            ${getDashboardIcon('info', 'w-4 h-4 text-rose-700')} بازنشانی داده‌های آزمایشی (Demo Reset)
          </h3>
          <p class="text-xs text-rose-800 leading-relaxed">
            در صورت ایجاد تغییرات آزمایشی در دانش‌آموزان، کلاس‌ها یا نمرات، می‌توانید داده‌های دمو را به حالت اولیه بازگردانید.
          </p>
        </div>
      </div>
    `;

    const resetBtn = createElement('button', {
      className:
        'px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs',
      textContent: 'بازنشانی کامل داده‌های دمو',
    });

    resetBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'بازنشانی داده‌های آزمایشی',
        content: 'آیا از بازنشانی کلیه داده‌های دمو (دانش‌آموزان، کلاس‌ها، حضور و غیاب و نمرات) به حالت اولیه اطمینان دارید؟',
        confirmText: 'تأیید و بازنشانی کامل',
        cancelText: 'انصراف',
        onConfirm: () => {
          schoolStore.resetDemoData();
          showToast({ title: 'بازنشانی انجام شد', message: 'داده‌های دمو به حالت اولیه بازیابی گردیدند.', type: 'info' });
          render();
        },
      });
      modal.open();
    });

    resetCard.appendChild(resetBtn);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(createThemePanel());
    rootWrapper.appendChild(formCard);
    rootWrapper.appendChild(resetCard);
  };

  render();
  return rootWrapper;
}
