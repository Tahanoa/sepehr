/**
 * POLARIS PARENT ATTENDANCE REPORT PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createParentAttendancePage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const students = schoolStore.getStudents(orgId);
  const child = students.find((s) => s.guardianName.includes('رضایی') || s.guardianName.includes('عباسی') || s.guardianName.includes('تهرانی')) || students[0];

  const attendance = schoolStore.getAttendance(orgId).filter((a) => child && a.studentId === child.id);

  const render = () => {
    rootWrapper.innerHTML = '';

    const headerRow = createElement('div', { className: 'pb-2 border-b border-border space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
        ${getDashboardIcon('attendance', 'w-6 h-6 text-primary')} گزارش حضور و غیاب فرزند
      </h2>
      <p class="text-xs sm:text-sm text-muted-foreground">مشاهده ریز سوابق حضور، غیبت‌ها و تأخیرهای ورودی ثبت‌شده توسط معلم.</p>
    `;

    const tableCard = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>تاریخ ثبت</th>
          <th class="text-center">کلاس</th>
          <th class="text-center">وضعیت حضور</th>
          <th>توضیحات معلم</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    if (attendance.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted-foreground py-6">سابقه‌ای برای نمایش موجود نیست.</td></tr>`;
    } else {
      attendance.forEach((att) => {
        const tr = createElement('tr');
        tr.innerHTML = `
          <td class="font-mono text-xs font-bold text-foreground">${att.date}</td>
          <td class="text-center text-xs text-muted-foreground">${child ? child.className : '-'}</td>
          <td class="text-center">
            <span class="px-2.5 py-1 rounded text-[10px] font-bold ${
              att.status === 'present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }">
              ${att.status === 'present' ? 'حاضر' : att.status === 'absent' ? 'غایب' : 'تأخیر'}
            </span>
          </td>
          <td class="text-xs text-muted-foreground">${att.notes || 'بدون توضیح'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tableCard);
  };

  render();
  return rootWrapper;
}
