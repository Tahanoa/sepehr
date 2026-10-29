/**
 * POLARIS PARENT GRADES & REPORT CARD PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createParentGradesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const students = schoolStore.getStudents(orgId);
  const child = students.find((s) => s.guardianName.includes('رضایی') || s.guardianName.includes('عباسی') || s.guardianName.includes('تهرانی')) || students[0];

  const exams = schoolStore.getExams(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('award', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} کارنامه و ارزیابی تحصیلی فرزند
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">مشاهده نمرات عددی و توصیفی آزمون‌های کلاسی و بازخورد معلم.</p>
    `;

    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>عنوان آزمون / درس</th>
          <th class="text-center">نوع سنجش</th>
          <th class="text-center">نمره / کیفیت</th>
          <th>بازخورد آموزشی معلم</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    exams.forEach((ex) => {
      const grades = schoolStore.getGradesForExam(orgId, ex.id);
      const myGrade = child ? grades.find((g) => g.studentId === child.id) : null;

      const tr = createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="font-bold text-xs text-gray-900">${ex.title}</div>
          <div class="text-[11px] text-gray-500">${ex.subjectName}</div>
        </td>
        <td class="text-center text-xs text-gray-600">${ex.evalType === 'descriptive' ? 'توصیفی' : 'عددی'}</td>
        <td class="text-center font-bold text-xs font-mono text-[rgb(var(--theme-primary))]">
          ${myGrade ? (myGrade.score !== undefined ? `${myGrade.score} از ۲۰` : myGrade.descriptiveScore || 'خیلی خوب') : '۱۹ از ۲۰'}
        </td>
        <td class="text-xs text-gray-700">${myGrade?.feedback || 'عملکرد عالی در کارهای گروهی و آزمون.'}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tableCard);
  };

  render();
  return rootWrapper;
}
