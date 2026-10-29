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
import { formatNumber } from '../../../utils/formatters';

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
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
        ${getDashboardIcon('chat', 'w-6 h-6 text-primary')} پیام‌ها به مدیریت مدرسه
      </h2>
      <p class="text-xs sm:text-sm text-muted-foreground">ارسال درخواست، پیگیری امور آموزشی، حضور و غیاب و دریافت پاسخ‌های رسمی مدیریت.</p>
    `;

    const newMsgBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ثبت پیام جدید به مدیریت`,
    });
    newMsgBtn.addEventListener('click', () => openNewConversationModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(newMsgBtn);

    // Conversations List Card
    const listCard = createElement('div', { className: 'space-y-3.5' });

    if (conversations.length === 0) {
      listCard.innerHTML = `<div class="bg-card text-card-foreground rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">هنوز گفتگویی ثبت نکرده‌اید. برای ارتباط با مدیریت، دکمه «ثبت پیام جدید به مدیریت» را کلیک کنید.</div>`;
    } else {
      conversations.forEach((conv) => {
        const item = createElement('div', {
          className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-3 cursor-pointer hover:border-primary transition-colors',
        });

        let statusBadge = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        let statusText = 'در انتظار پاسخ';
        if (conv.status === 'replied') {
          statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
          statusText = 'پاسخ داده شده';
        } else if (conv.status === 'resolved') {
          statusBadge = 'bg-surface-subtle text-muted-foreground border-border';
          statusText = 'بسته شده';
        }

        item.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg">${conv.studentName} (${conv.className})</span>
              <span class="text-[10px] text-muted-foreground">موضوع: ${conv.category === 'educational' ? 'آموزشی' : conv.category === 'attendance' ? 'حضور و غیاب' : 'اداری'}</span>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge}">${statusText}</span>
          </div>

          <h3 class="font-bold text-sm text-foreground">${conv.subject}</h3>
          <p class="text-xs text-muted-foreground line-clamp-2">${conv.messages[0]?.content || ''}</p>

          <div class="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span>تعداد پیام‌ها: ${formatNumber(conv.messages.length)}</span>
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

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-foreground' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">فرزند مربوطه *</label>
        <select id="pmsg-student" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-foreground">
          ${myChildren.map((c) => `<option value="${c.id}">${c.fullName} (${c.className})</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">دسته‌بندی پیام *</label>
          <select id="pmsg-category" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-foreground">
            <option value="educational">امور آموزشی و درسی</option>
            <option value="attendance">حضور و غیاب و مرخصی</option>
            <option value="administrative">درخواست اداری و گواهی</option>
            <option value="other">سایر موضوعات</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">عنوان پیام *</label>
          <input type="text" id="pmsg-subject" required class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground" placeholder="مثال: درخواست مرخصی دو روزه" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">متن کامل پیام *</label>
        <textarea id="pmsg-body" rows="4" required class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground leading-relaxed" placeholder="متن درخواست یا پیام خود را شرح دهید..."></textarea>
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
    const container = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-foreground' });

    const messagesList = createElement('div', { className: 'space-y-3 max-h-[300px] overflow-y-auto p-1' });

    conv.messages.forEach((msg) => {
      const isParent = msg.senderRole === 'parent';
      const msgBox = createElement('div', {
        className: `p-3.5 rounded-2xl border ${
          isParent ? 'bg-amber-500/10 border-amber-500/20 ms-6' : 'bg-emerald-500/10 border-emerald-500/20 me-6'
        } space-y-1.5`,
      });

      msgBox.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-border text-[11px]">
          <span class="font-extrabold ${isParent ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}">${msg.senderName}</span>
          <span class="font-mono text-muted-foreground text-[10px]">${msg.sentAt}</span>
        </div>
        <p class="text-xs text-foreground leading-relaxed">${msg.content}</p>
      `;

      messagesList.appendChild(msgBox);
    });

    const replyBox = createElement('div', { className: 'space-y-2 pt-2 border-t border-border' });
    replyBox.innerHTML = `
      <label class="block font-bold">ارسال پاسخ جدید در این گفتگو:</label>
      <textarea id="reply-text" rows="3" class="w-full bg-surface border border-border rounded-xl p-2 text-xs text-foreground" placeholder="متن پاسخ خود را وارد کنید..."></textarea>
    `;

    const sendReplyBtn = createElement('button', {
      className: 'w-full py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl transition-colors cursor-pointer',
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
