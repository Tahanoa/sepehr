/**
 * POLARIS PARENT MESSAGES & COMMUNICATION PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

import { authService } from '../../../services/auth-service';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { ParentConversation } from '../../../types/school';

export function createParentMessagesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const students = schoolStore.getStudents(orgId);
  const myChildren = students.filter(
    (s) =>
      (currentUser && s.guardianPhone === currentUser.phone) ||
      s.guardianName.includes('رضایی') ||
      s.guardianName.includes('عباسی') ||
      s.guardianName.includes('تهرانی')
  );

  const render = () => {
    rootWrapper.innerHTML = '';

    const conversations = schoolStore.getParentConversations(orgId, currentUser?.id);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('chat', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} پیام‌ها به مدیریت مدرسه
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">ارسال درخواست، پیگیری امور آموزشی، حضور و غیاب و دریافت پاسخ‌های رسمی مدیریت.</p>
    `;

    const newMsgBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ثبت پیام جدید به مدیریت`,
    });
    newMsgBtn.addEventListener('click', () => openNewConversationModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(newMsgBtn);

    // Conversations List Card
    const listCard = createElement('div', { className: 'space-y-3.5' });

    if (conversations.length === 0) {
      listCard.innerHTML = `<div class="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-500">هنوز گفتگویی ثبت نکرده‌اید. برای ارتباط با مدیریت، دکمه «ثبت پیام جدید به مدیریت» را کلیک کنید.</div>`;
    } else {
      conversations.forEach((conv) => {
        const item = createElement('div', {
          className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3 cursor-pointer hover:border-[rgb(var(--theme-primary))] transition-colors',
        });

        let statusBadge = 'bg-amber-100 text-amber-900 border-amber-200';
        let statusText = 'در انتظار پاسخ';
        if (conv.status === 'replied') {
          statusBadge = 'bg-emerald-100 text-emerald-900 border-emerald-200';
          statusText = 'پاسخ داده شده';
        } else if (conv.status === 'resolved') {
          statusBadge = 'bg-gray-100 text-gray-800 border-gray-200';
          statusText = 'بسته شده';
        }

        item.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-xs text-[rgb(var(--theme-primary))] bg-[rgb(var(--theme-subtle))] px-2.5 py-1 rounded-lg">${conv.studentName} (${conv.className})</span>
              <span class="text-[10px] text-gray-500">موضوع: ${conv.category === 'educational' ? 'آموزشی' : conv.category === 'attendance' ? 'حضور و غیاب' : 'اداری'}</span>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge}">${statusText}</span>
          </div>

          <h3 class="font-bold text-sm text-gray-900">${conv.subject}</h3>
          <p class="text-xs text-gray-600 line-clamp-2">${conv.messages[0]?.content || ''}</p>

          <div class="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>تعداد پیام‌ها: ${conv.messages.length}</span>
            <span class="font-mono">آخرین بروزرسانی: ${conv.updatedAt}</span>
          </div>
        `;

        item.addEventListener('click', () => openConversationDetailModal(conv));
        listCard.appendChild(item);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(listCard);
  };

  const openNewConversationModal = () => {
    const selectedChild = myChildren[0];

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">فرزند مربوطه *</label>
        <select id="pmsg-student" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
          ${myChildren.map((c) => `<option value="${c.id}">${c.fullName} (${c.className})</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">دسته‌بندی پیام *</label>
          <select id="pmsg-category" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            <option value="educational">امور آموزشی و درسی</option>
            <option value="attendance">حضور و غیاب و مرخصی</option>
            <option value="administrative">درخواست اداری و گواهی</option>
            <option value="other">سایر موضوعات</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">عنوان پیام *</label>
          <input type="text" id="pmsg-subject" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="مثال: درخواست مرخصی دو روزه" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">متن کامل پیام *</label>
        <textarea id="pmsg-body" rows="4" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs leading-relaxed" placeholder="متن درخواست یا پیام خود را شرح دهید..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'ارسال پیام جدید به مدیریت',
      content: form,
      confirmText: 'ارسال پیام',
      cancelText: 'انصراف',
      onConfirm: () => {
        const studentId = (form.querySelector('#pmsg-student') as HTMLSelectElement).value;
        const category = (form.querySelector('#pmsg-category') as HTMLSelectElement).value as ParentConversation['category'];
        const subject = (form.querySelector('#pmsg-subject') as HTMLInputElement).value.trim();
        const body = (form.querySelector('#pmsg-body') as HTMLTextAreaElement).value.trim();

        const child = myChildren.find((c) => c.id === studentId) || selectedChild;

        if (!subject || !body) {
          showToast({ title: 'فیلد خالی', message: 'لطفاً عنوان و متن پیام را وارد نمایید.', type: 'warning' });
          return;
        }

        schoolStore.addParentConversation(
          {
            organizationId: orgId,
            parentId: currentUser?.id || 'usr-sec-parent',
            parentName: currentUser?.name || 'ولی دانش‌آموز',
            parentPhone: currentUser?.phone || '۰۹۱۲۴۴۴۵۵۶۶',
            studentId: child ? child.id : 'std-1',
            studentName: child ? child.fullName : 'دانش‌آموز',
            className: child ? child.className : 'کلاس اصلی',
            category,
            subject,
          },
          body
        );

        showToast({ title: 'ارسال شد', message: 'پیام شما به مدیریت ارسال شد و در نوبت پاسخ‌گویی قرار گرفت.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openConversationDetailModal = (conv: ParentConversation) => {
    const container = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });

    const messagesList = createElement('div', { className: 'space-y-3 max-h-[300px] overflow-y-auto p-1' });

    conv.messages.forEach((msg) => {
      const isParent = msg.senderRole === 'parent';
      const msgBox = createElement('div', {
        className: `p-3.5 rounded-2xl border ${
          isParent ? 'bg-amber-50/70 border-amber-200 ms-6' : 'bg-emerald-50/70 border-emerald-200 me-6'
        } space-y-1.5`,
      });

      msgBox.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-gray-200/60 text-[11px]">
          <span class="font-semibold ${isParent ? 'text-amber-900' : 'text-emerald-950'}">${msg.senderName}</span>
          <span class="font-mono text-gray-500 text-[10px]">${msg.sentAt}</span>
        </div>
        <p class="text-xs text-gray-800 leading-relaxed">${msg.content}</p>
      `;

      messagesList.appendChild(msgBox);
    });

    const replyBox = createElement('div', { className: 'space-y-2 pt-2 border-t border-gray-200' });
    replyBox.innerHTML = `
      <label class="block font-bold">ارسال پاسخ جدید در این گفتگو:</label>
      <textarea id="reply-text" rows="3" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="متن پاسخ خود را وارد کنید..."></textarea>
    `;

    const sendReplyBtn = createElement('button', {
      className: 'w-full py-2 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold rounded-xl transition-colors cursor-pointer',
      textContent: 'ارسال پاسخ پیرو',
    });

    sendReplyBtn.addEventListener('click', () => {
      const textInput = container.querySelector('#reply-text') as HTMLTextAreaElement;
      const val = textInput?.value.trim();
      if (!val) return;

      schoolStore.addReplyToParentConversation(
        conv.id,
        currentUser?.id || 'usr-sec-parent',
        currentUser?.name || 'ولی دانش‌آموز',
        'parent',
        val
      );

      showToast({ title: 'ارسال شد', message: 'پاسخ شما با موفقیت ثبت شد.', type: 'success' });
      modal.close();
      render();
    });

    replyBox.appendChild(sendReplyBtn);

    container.appendChild(messagesList);
    container.appendChild(replyBox);

    const modal = new Modal({
      title: `گفتگو — ${conv.subject}`,
      content: container,
      confirmText: 'بستن',
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
