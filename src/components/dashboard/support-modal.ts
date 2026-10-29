/**
 * POLARIS DEVELOPER TEAM SUPPORT MODAL
 * Direct access interface to submit demo support requests and review local support tickets.
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
    className: 'bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]',
  });

  // Header
  const header = createElement('div', {
    className: 'bg-[rgb(var(--theme-primary))] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="p-2 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] rounded-xl font-bold">
        ${getDashboardIcon('settings', 'w-5 h-5')}
      </div>
      <div>
        <h3 class="text-base font-semibold text-white">ارتباط با تیم توسعه‌دهنده سپهر</h3>
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

  const navTabs = createElement('div', { className: 'flex gap-2 border-b border-gray-200 pb-2' });
  const tabCreateBtn = createElement('button', {
    className: 'px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-[rgb(var(--theme-primary))] text-white',
    textContent: 'ثبت درخواست جدید',
  });
  const tabListBtn = createElement('button', {
    className: 'px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200',
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
      tabCreateBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[rgb(var(--theme-primary))] text-white';
      tabListBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200';

      const form = createElement('form', { className: 'space-y-4' });
      form.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1 text-right">
            <label class="block text-xs font-bold text-gray-700">دسته‌بندی درخواست:</label>
            <select id="sup-category" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:border-[rgb(var(--theme-accent))]">
              <option value="technical">اشکال و بروز خطا (Technical Bug)</option>
              <option value="academic">سوال درباره فرآیند آموزشی</option>
              <option value="billing">امور مالی و شهریه</option>
              <option value="feature_request">پیشنهاد توسعه امکانات جدید</option>
            </select>
          </div>
          <div class="space-y-1 text-right">
            <label class="block text-xs font-bold text-gray-700">اولویت پاسخ‌گویی:</label>
            <select id="sup-priority" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:border-[rgb(var(--theme-accent))]">
              <option value="low">کم (عادی)</option>
              <option value="medium" selected>متوسط</option>
              <option value="high">بالا</option>
              <option value="urgent">فوری و حیاتی</option>
            </select>
          </div>
        </div>

        <div class="space-y-1 text-right">
          <label class="block text-xs font-bold text-gray-700">عنوان درخواست:</label>
          <input type="text" id="sup-title" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:border-[rgb(var(--theme-accent))]" placeholder="مثال: عدم مشاهده فایل در بخش گزارش‌ها">
        </div>

        <div class="space-y-1 text-right">
          <label class="block text-xs font-bold text-gray-700">شرح کامل درخواست:</label>
          <textarea id="sup-desc" rows="4" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 leading-relaxed focus:border-[rgb(var(--theme-accent))]" placeholder="جزئیات درخواست یا گام‌های بازتولید مشکل را بنویسید..."></textarea>
        </div>

        <button type="submit" class="w-full py-3 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-semibold rounded-xl shadow transition-colors">
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
      tabListBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-[rgb(var(--theme-primary))] text-white';
      tabCreateBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200';

      const tickets = schoolStore.getSupportTickets(organizationId);

      if (tickets.length === 0) {
        contentArea.innerHTML = `
          <div class="text-center py-10 text-gray-500 text-xs">
            هیچ تیکت پشتیبانی ثبتی موجود نیست.
          </div>
        `;
      } else {
        const list = createElement('div', { className: 'space-y-3' });
        tickets.forEach((t) => {
          const item = createElement('div', {
            className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs',
          });
          item.innerHTML = `
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-900">${t.title}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }">${t.status === 'resolved' ? 'پاسخ داده شده (بسته)' : 'در حال بررسی در دمو'}</span>
            </div>
            <p class="text-gray-700 leading-relaxed">${t.description}</p>
            <div class="text-[11px] text-gray-500 pt-1 border-t border-gray-200 flex justify-between">
              <span>فرستنده: ${t.userName} | تاریخ: ${t.createdAt}</span>
              <span>اولویت: ${t.priority}</span>
            </div>
            ${
              t.responseNotes
                ? `<div class="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900 mt-2"><strong>پاسخ تیم توسعه:</strong> ${t.responseNotes}</div>`
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
    className: 'bg-gray-50 border-t border-gray-200 p-4 flex justify-end shrink-0',
  });

  const closeFooterBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors',
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
