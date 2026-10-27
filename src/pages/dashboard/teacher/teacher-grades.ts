/**
 * POLARIS TEACHER GRADEBOOK PAGE
 * Class-scoped score entry, numeric scores (0-20) and descriptive qualitative feedback.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { showToast } from '../../../components/toast';

export function createTeacherGradesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const exams = schoolStore.getExams(orgId);
  const students = schoolStore.getStudents(orgId);

  let selectedExamId = exams.length > 0 ? exams[0]!.id : '';

  const render = () => {
    rootWrapper.innerHTML = '';

    const selectedExam = exams.find((e) => e.id === selectedExamId);
    const existingGrades = selectedExamId ? schoolStore.getGradesForExam(orgId, selectedExamId) : [];

    // Header Row
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200/80 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('award', 'w-6 h-6 text-[#012622]')} دفتر ثبت نمرات و ارزشیابی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">ثبت و ویرایش نمرات عددی و توصیفی دانش‌آموزان به تفکیک آزمون و درس.</p>
    `;

    // Exam Select Toolbar
    const toolbar = createElement('div', { className: 'bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3' });

    const examSelectGroup = createElement('div', { className: 'space-y-1 flex-1 min-w-[200px]' });
    examSelectGroup.innerHTML = `<label class="block text-[11px] font-bold text-gray-600">انتخاب آزمون / ارزشیابی:</label>`;

    const examSelect = createElement('select', { className: 'w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-900' });
    exams.forEach((ex) => {
      const opt = createElement('option', { textContent: `${ex.title} (${ex.subjectName})`, attributes: { value: ex.id } });
      if (ex.id === selectedExamId) opt.setAttribute('selected', 'true');
      examSelect.appendChild(opt);
    });

    examSelect.addEventListener('change', (e) => {
      selectedExamId = (e.target as HTMLSelectElement).value;
      render();
    });

    examSelectGroup.appendChild(examSelect);

    const saveAllBtn = createElement('button', {
      className: 'px-4 py-2 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer',
      innerHTML: `${getDashboardIcon('attendance', 'w-4 h-4')} <span>ثبت و ذخیره دفتر نمرات</span>`,
    });

    toolbar.appendChild(examSelectGroup);
    toolbar.appendChild(saveAllBtn);

    // Grade Table
    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });

    table.innerHTML = `
      <thead>
        <tr>
          <th>نام دانش‌آموز</th>
          <th class="text-center">کد دانش‌آموزی</th>
          <th class="text-center">کلاس</th>
          <th class="text-center">نمره / ارزشیابی</th>
          <th>بازخورد استاد</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');

    const draftGrades: Record<string, { score?: number; descScore?: any; feedback?: string }> = {};

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-6">دانش‌آموزی در سیستم ثبت نشده است.</td></tr>`;
    } else {
      students.forEach((std) => {
        const tr = createElement('tr');
        const existing = existingGrades.find((g) => g.studentId === std.id);

        draftGrades[std.id] = {
          score: existing?.score ?? 18,
          descScore: existing?.descriptiveScore ?? 'خیلی خوب',
          feedback: existing?.feedback ?? 'پاسخ‌های کامل',
        };

        tr.innerHTML = `
          <td>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-[#012622] text-white font-bold flex items-center justify-center text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
              <span class="font-bold text-xs text-gray-900">${std.fullName}</span>
            </div>
          </td>
          <td class="text-center font-mono text-xs text-gray-600">${std.studentCode}</td>
          <td class="text-center text-xs text-gray-600">${std.className}</td>
        `;

        // Score Input Cell
        const scoreTd = createElement('td', { className: 'text-center' });
        if (selectedExam?.evalType === 'descriptive') {
          const select = createElement('select', { className: 'bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs font-bold text-gray-900' });
          ['خیلی خوب', 'خوب', 'قابل قبول', 'نیازمند تلاش بیشتر'].forEach((opt) => {
            const o = createElement('option', { textContent: opt, attributes: { value: opt } });
            if (opt === draftGrades[std.id]!.descScore) o.setAttribute('selected', 'true');
            select.appendChild(o);
          });
          select.addEventListener('change', (e) => {
            draftGrades[std.id]!.descScore = (e.target as HTMLSelectElement).value;
          });
          scoreTd.appendChild(select);
        } else {
          const inp = createElement('input', {
            className: 'w-20 text-center bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs font-mono font-bold text-[#012622]',
            attributes: { type: 'number', step: '0.25', max: '20', min: '0', value: (draftGrades[std.id]!.score ?? 18).toString() },
          });
          inp.addEventListener('input', (e) => {
            draftGrades[std.id]!.score = parseFloat((e.target as HTMLInputElement).value) || 0;
          });
          scoreTd.appendChild(inp);
        }

        // Feedback Input Cell
        const fbTd = createElement('td');
        const fbInp = createElement('input', {
          className: 'w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-800',
          attributes: { type: 'text', value: draftGrades[std.id]!.feedback || '' },
        });
        fbInp.addEventListener('input', (e) => {
          draftGrades[std.id]!.feedback = (e.target as HTMLInputElement).value;
        });
        fbTd.appendChild(fbInp);

        tr.appendChild(scoreTd);
        tr.appendChild(fbTd);
        tbody.appendChild(tr);
      });
    }

    saveAllBtn.addEventListener('click', () => {
      if (!selectedExamId) return;

      const payload = students.map((std) => {
        const draft = draftGrades[std.id]!;
        const item: { studentId: string; score?: number; descriptiveScore?: any; feedback?: string } = {
          studentId: std.id,
        };
        if (draft.score !== undefined) item.score = draft.score;
        if (draft.descScore) item.descriptiveScore = draft.descScore;
        if (draft.feedback) item.feedback = draft.feedback;
        return item;
      });

      schoolStore.saveStudentGrades(orgId, selectedExamId, payload);
      showToast({ title: 'ذخیره شد', message: 'کلیه نمرات دفتر ارزشیابی با موفقیت ثبت گردید.', type: 'success' });
      render();
    });

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableCard);
  };

  render();
  return rootWrapper;
}
