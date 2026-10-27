/**
 * POLARIS COUNSELOR MESSAGING & PRIVACY PAGE
 * Send general announcements or private targeted messages to students and parents with clear privacy scoping.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createCounselorMessagesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const messages = schoolStore.getMessages(orgId);
  const students = schoolStore.getStudents(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('chat', 'w-6 h-6 text-[#012622]')} پیام‌رسانی مشاوره‌ای و تفکیک حریم خصوصی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">ارسال پیام‌های عمومی برنامه‌ریزی یا پیام‌های خصوصی هدایت تحصیلی به دانش‌آموزان و اولیا.</p>
    `;

    const newMsgBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ارسال پیام مشاوره‌ای جدید`,
    });
    newMsgBtn.addEventListener('click', () => openNewMessageModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(newMsgBtn);

    // Messages Feed
    const listCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3' });

    if (messages.length === 0) {
      listCard.innerHTML = `<div class="text-xs text-gray-500 py-6 text-center">هیچ پیامی ثبت نشده است.</div>`;
    } else {
      messages.forEach((msg) => {
        const item = createElement('div', { className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs' });
        item.innerHTML = `
          <div class="flex items-center justify-between border-b border-gray-200 pb-2">
            <span class="font-extrabold text-gray-900">گیرنده: ${msg.recipientName} (${msg.recipientRole === 'student' ? 'دانش‌آموز' : 'ولی'})</span>
            <span class="text-[11px] font-mono text-gray-500">${msg.sentAt}</span>
          </div>
          <h4 class="font-bold text-gray-800">${msg.subject}</h4>
          <p class="text-gray-700 leading-relaxed">${msg.content}</p>
          <div class="flex gap-2 pt-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${msg.visibleToStudent ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">
              ${msg.visibleToStudent ? 'قابل مشاهده برای دانش‌آموز' : 'مخفی از دانش‌آموز'}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${msg.visibleToParent ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">
              ${msg.visibleToParent ? 'قابل مشاهده برای ولی' : 'مخفی از ولی'}
            </span>
          </div>
        `;
        listCard.appendChild(item);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(listCard);
  };

  const openNewMessageModal = () => {
    const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dir-rtl' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">انتخاب گیرنده پیام *</label>
        <select id="msg-recipient" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs">
          ${students.map((s) => `<option value="${s.id}">${s.fullName} (دانش‌آموز پایه ${s.gradeLevel})</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">موضوع پیام *</label>
        <input type="text" id="msg-subject" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="مثال: پیگیری ساعات مطالعه آزمون‌های جامع" />
      </div>

      <div>
        <label class="block font-bold mb-1">متن پیام *</label>
        <textarea id="msg-content" rows="4" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="متن راهنمایی و مشاوره..."></textarea>
      </div>

      <div class="space-y-2 border-t border-gray-200 pt-3">
        <label class="block font-bold">سطح دسترسی و حریم خصوصی:</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="msg-vis-std" checked class="rounded border-gray-300 text-[#012622]" />
            <span>قابل مشاهده برای دانش‌آموز</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="msg-vis-prt" checked class="rounded border-gray-300 text-[#012622]" />
            <span>قابل مشاهده برای ولی</span>
          </label>
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'ارسال پیام جدید مشاوره',
      content: form,
      confirmText: 'ارسال پیام',
      cancelText: 'انصراف',
      onConfirm: () => {
        const studentId = (form.querySelector('#msg-recipient') as HTMLSelectElement).value;
        const subject = (form.querySelector('#msg-subject') as HTMLInputElement).value.trim();
        const contentStr = (form.querySelector('#msg-content') as HTMLTextAreaElement).value.trim();
        const visStd = (form.querySelector('#msg-vis-std') as HTMLInputElement).checked;
        const visPrt = (form.querySelector('#msg-vis-prt') as HTMLInputElement).checked;

        const targetStd = students.find((s) => s.id === studentId) || students[0];

        if (targetStd) {
          schoolStore.addMessage({
            organizationId: orgId,
            senderId: membership.userId,
            senderName: authService.getCurrentUser()?.name || 'دکتر سارا کریمی (مشاور)',
            senderRole: 'counselor',
            recipientId: targetStd.id,
            recipientName: targetStd.fullName,
            recipientRole: 'student',
            subject,
            content: contentStr,
            isPrivate: true,
            isCounselingNote: true,
            visibleToStudent: visStd,
            visibleToParent: visPrt,
          });

          showToast({ title: 'ارسال شد', message: 'پیام مشاوره‌ای با موفقیت ارسال گردید.', type: 'success' });
          render();
        }
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
