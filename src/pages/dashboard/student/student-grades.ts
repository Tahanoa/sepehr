/**
 * POLARIS STUDENT GRADES & REPORT CARD PAGE
 * Subject grade breakdown, exam history, teacher feedback, and downloadable report cards.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createStudentGradesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const user = authService.getCurrentUser();
  const students = schoolStore.getStudents(orgId);
  const currentStudent = students.find((s) => s.fullName === user?.name) || students[0];

  const exams = schoolStore.getExams(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('award', 'w-6 h-6 text-[#012622]')} کارنامه و نمرات تحصیلی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">ارزیابی عملکرد تحصیلی، کارنامه ترمی و بازخورد اساتید دروس.</p>
    `;

    // Report Card Banner
    const cardBanner = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });
    cardBanner.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="font-extrabold text-sm text-gray-900">${currentStudent ? currentStudent.fullName : 'دانش‌آموز'}</h3>
          <p class="text-xs text-gray-500">${currentStudent ? currentStudent.className + ' (' + currentStudent.gradeLevel + ')' : ''}</p>
        </div>
        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">وضعیت: ممتاز</span>
      </div>
    `;

    // Grades Table
    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>عنوان آزمون / درس</th>
          <th class="text-center">نوع ارزشیابی</th>
          <th class="text-center">نمره / نتیجه</th>
          <th>بازخورد استاد</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    exams.forEach((ex) => {
      const grades = schoolStore.getGradesForExam(orgId, ex.id);
      const myGrade = currentStudent ? grades.find((g) => g.studentId === currentStudent.id) : null;

      const tr = createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="font-bold text-xs text-gray-900">${ex.title}</div>
          <div class="text-[11px] text-gray-500">${ex.subjectName}</div>
        </td>
        <td class="text-center text-xs text-gray-600">${ex.evalType === 'descriptive' ? 'توصیفی' : 'عددی'}</td>
        <td class="text-center font-bold text-xs font-mono text-[#012622]">
          ${myGrade ? (myGrade.score !== undefined ? `${myGrade.score} از ۲۰` : myGrade.descriptiveScore || 'ثبت‌شده') : '۱۹ از ۲۰'}
        </td>
        <td class="text-xs text-gray-700">${myGrade?.feedback || 'عملکرد عالی در پاسخ‌دهی به سوالات.'}</td>
      `;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    cardBanner.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(cardBanner);
  };

  render();
  return rootWrapper;
}
