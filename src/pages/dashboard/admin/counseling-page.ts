/**
 * POLARIS COUNSELING COORDINATION PAGE
 * Student counseling referrals, priority levels, appointment scheduling,
 * status updates, and administrative coordination view with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { CounselingPriority, CounselingStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createCounselingPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let selectedPriority = 'all';
  let selectedStatus = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const referrals = schoolStore.getCounselingReferrals(orgId);

    // Filtering
    const filtered = referrals.filter((c) => {
      const matchPriority = selectedPriority === 'all' || c.priority === selectedPriority;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;
      return matchPriority && matchStatus;
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('chat', 'w-6 h-6 text-[#012622] dark:text-teal-400')} هماهنگی و خدمات مشاوره تحصیلی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal',
      textContent: `بررسی پرونده‌های ارجاعی به مشاور (${referrals.length.toLocaleString('fa-IR')} مورد)، تعیین اولویت و برنامه‌ریزی جلسات تعاملی.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ثبت ارجاع مشاوره‌ای جدید`,
    });
    addBtn.addEventListener('click', () => openAddReferralModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Filter Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3',
    });

    const prioritySelect = createElement('select', {
      className: 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });
    prioritySelect.innerHTML = `
      <option value="all" ${selectedPriority === 'all' ? 'selected' : ''}>همه اولویت‌ها</option>
      <option value="high" ${selectedPriority === 'high' ? 'selected' : ''}>اولویت بالا (فوریت)</option>
      <option value="medium" ${selectedPriority === 'medium' ? 'selected' : ''}>اولویت متوسط</option>
      <option value="low" ${selectedPriority === 'low' ? 'selected' : ''}>اولویت عادی</option>
    `;
    prioritySelect.addEventListener('change', (e) => {
      selectedPriority = (e.target as HTMLSelectElement).value;
      render();
    });

    const statusSelect = createElement('select', {
      className: 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });
    statusSelect.innerHTML = `
      <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>همه وضعیت‌های رسیدگی</option>
      <option value="pending" ${selectedStatus === 'pending' ? 'selected' : ''}>در انتظار تعیین وقت</option>
      <option value="in_progress" ${selectedStatus === 'in_progress' ? 'selected' : ''}>در حال پیگیری</option>
      <option value="completed" ${selectedStatus === 'completed' ? 'selected' : ''}>تکمیل و مختومه</option>
    `;
    statusSelect.addEventListener('change', (e) => {
      selectedStatus = (e.target as HTMLSelectElement).value;
      render();
    });

    toolbar.appendChild(prioritySelect);
    toolbar.appendChild(statusSelect);

    // Referral Cards List
    const list = createElement('div', { className: 'space-y-3.5' });

    if (filtered.length === 0) {
      const emptyState = createElement('div', {
        className: 'bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs',
        textContent: 'موردی با فیلترهای انتخابی در سیستم مشاوره ثبت نشده است.',
      });
      list.appendChild(emptyState);
    } else {
      filtered.forEach((ref) => {
        const itemCard = createElement('div', {
          className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-3',
        });

        let priorityBadge = 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        if (ref.priority === 'high') priorityBadge = 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-extrabold';
        else if (ref.priority === 'medium') priorityBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold';

        let statusBadge = 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300';
        let statusText = 'در حال پیگیری';
        if (ref.status === 'pending') {
          statusBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300';
          statusText = 'در انتظار نوبت';
        } else if (ref.status === 'completed') {
          statusBadge = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300';
          statusText = 'جلسات به پایان رسید';
        }

        itemCard.innerHTML = `
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm text-gray-900 dark:text-gray-100">${ref.studentName}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">(${ref.className})</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[10px] ${priorityBadge}">${ref.priority === 'high' ? 'اولویت بالا' : 'عادی'}</span>
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold ${statusBadge}">${statusText}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
            <div><strong>علت ارجاع:</strong> ${ref.reason}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500 dark:text-gray-400 text-[11px]">
              <div><strong>ارجاع‌دهنده:</strong> ${ref.referredBy}</div>
              <div><strong>مشاور مسئول:</strong> ${ref.counselorName}</div>
            </div>
            ${
              ref.scheduledAppointment
                ? `<div class="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-300 rounded-xl font-bold text-[11px]"><strong>نوبت ملاقات:</strong> ${ref.scheduledAppointment}</div>`
                : ''
            }
          </div>
        `;

        const actionsRow = createElement('div', { className: 'pt-2 flex items-center justify-end gap-2 text-xs' });
        const updateStatusBtn = createElement('button', {
          className: 'px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition-colors cursor-pointer',
          textContent: 'تغییر وضعیت پیگیری',
        });
        updateStatusBtn.addEventListener('click', () => openUpdateStatusModal(ref));

        actionsRow.appendChild(updateStatusBtn);
        itemCard.appendChild(actionsRow);

        list.appendChild(itemCard);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(list);
  };

  const openAddReferralModal = () => {
    const students = schoolStore.getStudents(orgId);
    const staff = schoolStore.getStaff(orgId);
    const counselors = staff.filter((st) => st.role === 'counselor');

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800 dark:text-gray-200' });

    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">انتخاب دانش‌آموز *</label>
        <select id="ref-student" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100">
          ${students.map((s) => `<option value="${s.id}">${s.fullName} - ${s.className}</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">ارائه دهنده ارجاع *</label>
          <input type="text" id="ref-by" value="دبیر مربوطه" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label class="block font-bold mb-1">درجه اولویت *</label>
          <select id="ref-priority" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100">
            <option value="high">اولویت بالا (نیازمند اقدام فوری)</option>
            <option value="medium" selected>اولویت متوسط</option>
            <option value="low">اولویت عادی</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">علت اصلی ارجاع *</label>
        <textarea id="ref-reason" rows="2" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" placeholder="توضیح کوتاه علت ارجاع تحصیلی یا انضباطی..."></textarea>
      </div>

      <div>
        <label class="block font-bold mb-1">مشاور ارشد مسئول</label>
        <select id="ref-counselor" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100">
          ${
            counselors.length > 0
              ? counselors.map((c) => `<option value="${c.fullName}">${c.fullName}</option>`).join('')
              : `<option value="دکتر سارا کریمی">دکتر سارا کریمی</option>`
          }
        </select>
      </div>
    `;

    const modal = new Modal({
      title: 'ثبت ارجاع جدید مشاوره‌ای',
      content: form,
      confirmText: 'ثبت ارجاع',
      cancelText: 'انصراف',
      onConfirm: () => {
        const studentId = (form.querySelector('#ref-student') as HTMLSelectElement).value;
        const referredBy = (form.querySelector('#ref-by') as HTMLInputElement).value.trim();
        const priority = (form.querySelector('#ref-priority') as HTMLSelectElement).value as CounselingPriority;
        const reason = (form.querySelector('#ref-reason') as HTMLTextAreaElement).value.trim();
        const counselorName = (form.querySelector('#ref-counselor') as HTMLSelectElement).value;

        const std = students.find((s) => s.id === studentId);

        if (!reason || !std) {
          showToast({ title: 'فیلد خالی', message: 'توضیح علت ارجاع الزامی است.', type: 'warning' });
          return;
        }

        schoolStore.addCounselingReferral({
          organizationId: orgId,
          studentId: std.id,
          studentName: std.fullName,
          className: std.className,
          referredBy,
          referralDate: new Date().toLocaleDateString('fa-IR'),
          reason,
          priority,
          status: 'pending',
          counselorName,
        });

        showToast({ title: 'ثبت ارجاع', message: 'مورد ارجاع مشاوره‌ای با موفقیت ثبت شد.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openUpdateStatusModal = (ref: any) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800 dark:text-gray-200' });

    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">تغییر وضعیت رسیدگی *</label>
        <select id="update-status" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100">
          <option value="pending" ${ref.status === 'pending' ? 'selected' : ''}>در انتظار تعیین وقت</option>
          <option value="in_progress" ${ref.status === 'in_progress' ? 'selected' : ''}>در حال برگزاری جلسه و پیگیری</option>
          <option value="completed" ${ref.status === 'completed' ? 'selected' : ''}>تکمیل جلسات و مختومه</option>
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">ملاحظات و گزارش جلسات</label>
        <textarea id="update-notes" rows="3" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" placeholder="یادداشت‌های محرمانه مشاور...">${ref.privateNotes || ''}</textarea>
      </div>
    `;

    const modal = new Modal({
      title: `بروزرسانی پیگیری پرونده ${ref.studentName}`,
      content: form,
      confirmText: 'بروزرسانی وضعیت',
      cancelText: 'انصراف',
      onConfirm: () => {
        const newStatus = (form.querySelector('#update-status') as HTMLSelectElement).value as CounselingStatus;
        const notes = (form.querySelector('#update-notes') as HTMLTextAreaElement).value.trim();

        schoolStore.updateCounselingStatus(ref.id, newStatus, notes);
        showToast({ title: 'بروزرسانی شد', message: 'وضعیت پرونده مشاوره تغییر یافت.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
