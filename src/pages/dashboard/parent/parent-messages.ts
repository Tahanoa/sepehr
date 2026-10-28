/**
 * POLARIS PARENT MESSAGES & COMMUNICATION PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createParentMessagesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const messages = schoolStore.getMessages(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('chat', 'w-6 h-6 text-[#012622]')} ارتباط با کادر آموزشی و مشاور
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">پیام‌های دریافتی از معلمان، مشاور تحصیلی و مدیریت مدرسه.</p>
    `;

    const listCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3' });

    if (messages.length === 0) {
      listCard.innerHTML = `<div class="text-xs text-gray-500 py-6 text-center">پیامی در صندوق ورودی موجود نیست.</div>`;
    } else {
      messages.forEach((msg) => {
        const item = createElement('div', { className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs' });
        item.innerHTML = `
          <div class="flex items-center justify-between border-b border-gray-200 pb-2">
            <span class="font-extrabold text-gray-900">${msg.senderName} (${msg.senderRole === 'counselor' ? 'مشاور تحصیلی' : 'معلم'})</span>
            <span class="text-[11px] font-mono text-gray-500">${msg.sentAt}</span>
          </div>
          <h4 class="font-bold text-gray-800">${msg.subject}</h4>
          <p class="text-gray-700 leading-relaxed">${msg.content}</p>
        `;
        listCard.appendChild(item);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(listCard);
  };

  render();
  return rootWrapper;
}
