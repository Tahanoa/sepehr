/**
 * POLARIS DEVELOPER TEAM SUPPORT MODAL
 * Direct access interface to submit demo support requests and review local support tickets with dark mode support.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';
import { schoolStore } from '../../services/school-store';
import { User } from '../../types/auth';

export interface SupportModalOptions {
  user: User;
  organizationId: string;
  onClose: () => void;
}

export function createSupportModal(options: SupportModalOptions): HTMLElement {
  const { user, organizationId, onClose } = options;

  const backdrop = createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl animate-fadeIn',
  });

  const dialog = createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]',
  });

  // Header
  const header = createElement('div', {
    className: 'bg-[#012622] dark:bg-[#071513] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="p-2 bg-[#E98A15] text-[#012622] rounded-xl font-bold">
        ${getDashboardIcon('settings', 'w-5 h-5')}
      </div>
      <div>
        <h3 class="text-base font-extrabold text-white">ارتباط با تیم توسعه‌دهنده پولاریس</h3>
        <p class="text-xs text-amber-200">ثبت درخواست فنی، بازخورد و سوابق تیکت‌های پشتیبانی دمو</p>
      </div>
    </div>
  `;

  const closeBtn = createElement('button', {
    className: 'text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors',
    innerHTML: getDashboardIcon('close', 'w-5 h-5'),
  });
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  // Body Container with Tabs (ثبت تیکت جدید / سوابق تیکت‌ها)
  const body = createElement('div', { className: 'p-6 overflow-y-auto space-y-5 flex-1' });

  let activeTab: 'create' | 'list' = 'create';

  const navTabs = createElement('div', { className: 'flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2' });
  const tabCreateBtn = createElement('button', {
    className: 'px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-[#012622] dark:bg-teal-700 text-white',
    textContent: 'ثبت درخواست جدید',
  });
  const tabListBtn = createElement('button', {
    className: 'px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
    textContent: 'سوابق تیکت‌های دمو',
  });

  navTabs.appendChild(tabCreateBtn);
  navTabs.appendChild(tabListBtn);
  body.appendChild(navTabs);

  const contentArea = createElement('div', { className: 'space-y-4' });
  body.appendChild(contentArea);

  const renderContent = () => {
    contentArea.innerHTML = '';

    if (activeTab === 'create') {
      tabCreateBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#012622] dark:bg-teal-700 text-white';
      tabListBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';

      const form = createElement('form', { className: 'space-y-4' });
      form.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1 text-right">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">دسته‌بندی درخواست:</label>
            <select id="sup-category" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-bold text-gray-800 dark:text-gray-100 focus:border-[#E98A15]">
              <option value="technical">اشکال و بروز خطا (Technical Bug)</option>
              <option value="academic">سوال درباره فرآیند آموزشی</option>
              <option value="billing">امور مالی و شهریه</option>
              <option value="feature_request">پیشنهاد توسعه امکانات جدید</option>
            </select>
          </div>
          <div class="space-y-1 text-right">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">اولویت پاسخ‌گویی:</label>
            <select id="sup-priority" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-bold text-gray-800 dark:text-gray-100 focus:border-[#E98A15]">
              <option value="low">کم (عادی)</option>
              <option value="medium" selected>متوسط</option>
              <option value="high">بالا</option>
              <option value="urgent">فوری و حیاتی</option>
            </select>
          </div>
        </div>

        <div class="space-y-1 text-right">
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">عنوان درخواست:</label>
          <input type="text" id="sup-title" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100 focus:border-[#E98A15]" placeholder="مثال: عدم مشاهده فایل در بخش گزارش‌ها">
        </div>

        <div class="space-y-1 text-right">
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">شرح کامل درخواست:</label>
          <textarea id="sup-desc" rows="4" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100 leading-relaxed focus:border-[#E98A15]" placeholder="جزئیات درخواست یا گام‌های بازتولید مشکل را بنویسید..."></textarea>
        </div>

        <button type="submit" class="w-full py-3 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-extrabold rounded-xl shadow transition-colors">
          ارسال درخواست به تیم توسعه
        </button>
      `;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const catInput = form.querySelector('#sup-category') as HTMLSelectElement;
        const prioInput = form.querySelector('#sup-priority') as HTMLSelectElement;
        const titleInput = form.querySelector('#sup-title') as HTMLInputElement;
        const descInput = form.querySelector('#sup-desc') as HTMLTextAreaElement;

        schoolStore.addSupportTicket({
          organizationId,
          userId: user.id,
          userName: user.name,
          userRole: user.memberships[0]?.role || 'کاربر',
          category: catInput.value as any,
          priority: prioInput.value as any,
          title: titleInput.value,
          description: descInput.value,
        });

        alert('درخواست شما با موفقیت ثبت شد و در سوابق قرار گرفت.');
        activeTab = 'list';
        renderContent();
      });

      contentArea.appendChild(form);
    } else {
      tabListBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[#012622] dark:bg-teal-700 text-white';
      tabCreateBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600';

      const tickets = schoolStore.getSupportTickets(organizationId);

      if (tickets.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-10 text-gray-500 dark:text-gray-400 text-xs">
            هیچ تیکت پشتیبانی ثبتی موجود نیست.
          </div>
        `;
      } else {
        const list = createElement('div', { className: 'space-y-3' });
        tickets.forEach((t) => {
          const item = createElement('div', {
            className: 'p-4 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2 text-xs',
          });
          item.innerHTML = `
            <div class="flex justify-between items-center">
              <span class="font-extrabold text-gray-900 dark:text-gray-100">${t.title}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                t.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }">${t.status === 'resolved' ? 'پاسخ داده شده (بسته)' : 'در حال بررسی در دمو'}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${t.description}</p>
            <div class="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <span>فرستنده: ${t.userName} | تاریخ: ${t.createdAt}</span>
              <span>اولویت: ${t.priority}</span>
            </div>
            ${
              t.responseNotes
                ? `<div class="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2.5 rounded-lg text-emerald-900 dark:text-emerald-300 mt-2"><strong>پاسخ تیم توسعه:</strong> ${t.responseNotes}</div>`
                : ''
            }
          `;
          list.appendChild(item);
        });
        contentArea.appendChild(list);
      }
    }
  };

  tabCreateBtn.addEventListener('click', () => {
    activeTab = 'create';
    renderContent();
  });

  tabListBtn.addEventListener('click', () => {
    activeTab = 'list';
    renderContent();
  });

  renderContent();

  // Footer Actions
  const footer = createElement('div', {
    className: 'bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end shrink-0',
  });

  const closeFooterBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors',
    textContent: 'بستن',
  });
  closeFooterBtn.addEventListener('click', onClose);
  footer.appendChild(closeFooterBtn);

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  backdrop.appendChild(dialog);
  return backdrop;
}
