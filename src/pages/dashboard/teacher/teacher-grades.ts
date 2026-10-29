/**
 * POLARIS TEACHER GRADEBOOK PAGE
 * Class-scoped score entry, numeric scores (0-20) and descriptive qualitative feedback with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { Modal } from '../../../components/modal';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { showToast } from '../../../components/toast';

export function createTeacherGradesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const subjects = schoolStore.getSubjects(orgId);
  const exams = schoolStore.getExams(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';
  let selectedSubjectId = subjects.length > 0 ? subjects[0]!.id : '';
  let selectedExamId = exams.length > 0 ? exams[0]!.id : '';

  const weeks = [
    { id: 'w1', label: 'هفته اول اسفند (۱ تا ۷ اسفند)', name: 'هفته اول اسفند' },
    { id: 'w2', label: 'هفته دوم اسفند (۸ تا ۱۴ اسفند)', name: 'هفته دوم اسفند' },
    { id: 'w3', label: 'هفته سوم اسفند (۱۵ تا ۲۱ اسفند)', name: 'هفته سوم اسفند' },
    { id: 'w4', label: 'هفته چهارم اسفند (۲۲ تا ۲۸ اسفند)', name: 'هفته چهارم اسفند' },
  ];
  let selectedWeekIdx = 0;

  const render = () => {
    rootWrapper.innerHTML = '';

    const allStudents = schoolStore.getStudents(orgId);
    const classStudents = allStudents.filter((s) => s.classId === selectedClassId);

    const selectedExam = exams.find((e) => e.id === selectedExamId);
    const existingGrades = selectedExamId ? schoolStore.getGradesForExam(orgId, selectedExamId) : [];
    const activeWeek = weeks[selectedWeekIdx]!;

    // Header Row
    const headerRow = createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80' });
    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
        ${getDashboardIcon('award', 'w-6 h-6 text-[#012622] dark:text-teal-400')} دفتر ثبت نمرات و یادداشت‌های هفتگی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ثبت نمرات، ارزشیابی توصیفی و یادداشت‌های روزانه استاد به تفکیک هفته‌های آموزشی.</p>
    `;

    // Week Navigator
    const weekNav = createElement('div', { className: 'flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700' });
    const prevWeekBtn = createElement('button', {
      className: 'p-2 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer',
      innerHTML: '← هفته قبل',
      attributes: { ...(selectedWeekIdx === 0 ? { disabled: 'true' } : {}) },
    });
    prevWeekBtn.addEventListener('click', () => {
      if (selectedWeekIdx > 0) {
        selectedWeekIdx--;
        render();
      }
    });

    const currentWeekBadge = createElement('span', {
      className: 'px-4 py-2 bg-[#012622] dark:bg-teal-700 text-white rounded-xl text-xs font-black',
      textContent: activeWeek.label,
    });

    const nextWeekBtn = createElement('button', {
      className: 'p-2 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer',
      innerHTML: 'هفته بعد →',
      attributes: { ...(selectedWeekIdx === weeks.length - 1 ? { disabled: 'true' } : {}) },
    });
    nextWeekBtn.addEventListener('click', () => {
      if (selectedWeekIdx < weeks.length - 1) {
        selectedWeekIdx++;
        render();
      }
    });

    weekNav.appendChild(prevWeekBtn);
    weekNav.appendChild(currentWeekBadge);
    weekNav.appendChild(nextWeekBtn);

    headerRow.appendChild(headerText);
    headerRow.appendChild(weekNav);

    // Toolbar Selector
    const toolbar = createElement('div', { className: 'bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center' });

    // Class Select
    const classGroup = createElement('div', { className: 'space-y-1' });
    classGroup.innerHTML = `<label class="block text-[11px] font-bold text-gray-600 dark:text-gray-400">کلاس آموزشی:</label>`;
    const classSelect = createElement('select', { className: 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs font-bold text-gray-900 dark:text-gray-100' });
    classes.forEach((c) => {
      const opt = createElement('option', { textContent: `${c.name} (${c.gradeLevel})`, attributes: { value: c.id } });
      if (c.id === selectedClassId) opt.setAttribute('selected', 'true');
      classSelect.appendChild(opt);
    });
    classSelect.addEventListener('change', (e) => {
      selectedClassId = (e.target as HTMLSelectElement).value;
      render();
    });
    classGroup.appendChild(classSelect);

    // Subject Select
    const sbjGroup = createElement('div', { className: 'space-y-1' });
    sbjGroup.innerHTML = `<label class="block text-[11px] font-bold text-gray-600 dark:text-gray-400">درس مرتبط:</label>`;
    const sbjSelect = createElement('select', { className: 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs font-bold text-gray-900 dark:text-gray-100' });
    subjects.forEach((s) => {
      const opt = createElement('option', { textContent: `${s.name} (${s.gradeLevel})`, attributes: { value: s.id } });
      if (s.id === selectedSubjectId) opt.setAttribute('selected', 'true');
      sbjSelect.appendChild(opt);
    });
    sbjSelect.addEventListener('change', (e) => {
      selectedSubjectId = (e.target as HTMLSelectElement).value;
      render();
    });
    sbjGroup.appendChild(sbjSelect);

    // Exam Select
    const examSelectGroup = createElement('div', { className: 'space-y-1' });
    examSelectGroup.innerHTML = `<label class="block text-[11px] font-bold text-gray-600 dark:text-gray-400">آزمون / سرفصل ارزیابی:</label>`;
    const examSelect = createElement('select', { className: 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs font-bold text-gray-900 dark:text-gray-100' });
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

    toolbar.appendChild(classGroup);
    toolbar.appendChild(sbjGroup);
    toolbar.appendChild(examSelectGroup);

    const saveAllBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
      innerHTML: `${getDashboardIcon('attendance', 'w-4 h-4')} <span>ثبت و ذخیره دفتر نمرات</span>`,
    });

    // Grade Table
    const tableCard = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });

    table.innerHTML = `
      <thead>
        <tr>
          <th>نام دانش‌آموز</th>
          <th class="text-center">کد دانش‌آموزی</th>
          <th class="text-center">کلاس</th>
          <th class="text-center">نمره / ارزشیابی</th>
          <th>بازخورد استاد</th>
          <th class="text-center">عملیات یادداشت</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    const draftGrades: Record<string, { score?: number; descScore?: any; feedback?: string }> = {};

    if (classStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 dark:text-gray-400 py-6">دانش‌آموزی در این کلاس یافت نشد.</td></tr>`;
    } else {
      classStudents.forEach((std) => {
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
              <div class="w-7 h-7 rounded-full bg-[#012622] dark:bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
              <span class="font-bold text-xs text-gray-900 dark:text-gray-100">${std.fullName}</span>
            </div>
          </td>
          <td class="text-center font-mono text-xs text-gray-600 dark:text-gray-400">${std.studentCode}</td>
          <td class="text-center text-xs text-gray-600 dark:text-gray-400">${std.className}</td>
        `;

        // Score Input Cell
        const scoreTd = createElement('td', { className: 'text-center' });
        if (selectedExam?.evalType === 'descriptive') {
          const select = createElement('select', { className: 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1.5 text-xs font-bold text-gray-900 dark:text-gray-100' });
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
            className: 'w-20 text-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1.5 text-xs font-mono font-bold text-[#012622] dark:text-teal-300',
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
          className: 'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 text-xs text-gray-800 dark:text-gray-100',
          attributes: { type: 'text', value: draftGrades[std.id]!.feedback || '' },
        });
        fbInp.addEventListener('input', (e) => {
          draftGrades[std.id]!.feedback = (e.target as HTMLInputElement).value;
        });
        fbTd.appendChild(fbInp);

        // Note action cell
        const noteTd = createElement('td', { className: 'text-center' });
        const addNoteBtn = createElement('button', {
          className: 'px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer',
          textContent: '+ یادداشت',
        });
        addNoteBtn.addEventListener('click', () => openAddNoteModal(std, activeWeek.name));
        noteTd.appendChild(addNoteBtn);

        tr.appendChild(scoreTd);
        tr.appendChild(fbTd);
        tr.appendChild(noteTd);
        tbody.appendChild(tr);
      });
    }

    saveAllBtn.addEventListener('click', () => {
      if (!selectedExamId) return;

      const payload = classStudents.map((std) => {
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

    // Weekly Notes Feed Section
    const notesSection = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-4' });
    const notesTitle = createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700' });
    notesTitle.innerHTML = `
      <h3 class="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
        ${getDashboardIcon('chat', 'w-4 h-4 text-[#012622] dark:text-teal-400')} یادداشت‌های ثبت‌شده برای ${activeWeek.name}
      </h3>
    `;

    const weeklyNotesList = schoolStore.getWeeklyNotes(orgId, selectedClassId).filter((n) => n.weekLabel === activeWeek.name);

    const notesGrid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3.5' });

    if (weeklyNotesList.length === 0) {
      notesGrid.innerHTML = `<div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-6 text-xs">هیچ یادداشتی برای این هفته ثبت نشده است. از جدول بالا دکمه «+ یادداشت» را برای دانش‌آموز انتخاب کنید.</div>`;
    } else {
      weeklyNotesList.forEach((note) => {
        const noteCard = createElement('div', { className: 'bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3.5 border border-gray-200/80 dark:border-gray-700 space-y-2 relative' });
        noteCard.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-xs text-gray-900 dark:text-gray-100">${note.studentName}</span>
            <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400">${note.noteDate}</span>
          </div>
          <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">${note.content}</p>
          <div class="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700 text-[10px]">
            <span class="text-gray-500 dark:text-gray-400">نویسنده: ${note.authorName}</span>
            <span class="px-2 py-0.5 rounded font-bold ${note.isParentVisible ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
              ${note.isParentVisible ? 'قابل مشاهده اولیا' : 'خصوصی کادر'}
            </span>
          </div>
        `;

        const delBtn = createElement('button', {
          className: 'absolute top-2 left-2 text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer p-1',
          innerHTML: '✕',
        });
        delBtn.addEventListener('click', () => {
          schoolStore.deleteWeeklyNote(note.id);
          showToast({ title: 'حذف شد', message: 'یادداشت با موفقیت حذف گردید.', type: 'info' });
          render();
        });

        noteCard.appendChild(delBtn);
        notesGrid.appendChild(noteCard);
      });
    }

    notesSection.appendChild(notesTitle);
    notesSection.appendChild(notesGrid);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableCard);
    rootWrapper.appendChild(notesSection);
  };

  const openAddNoteModal = (student: any, weekLabel: string) => {
    const selectedSbj = subjects.find((s) => s.id === selectedSubjectId);
    const selectedClass = classes.find((c) => c.id === selectedClassId);

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800 dark:text-gray-200' });
    form.innerHTML = `
      <div class="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
        <div class="font-bold text-gray-900 dark:text-gray-100">دانش‌آموز: ${student.fullName}</div>
        <div class="text-[11px] text-gray-600 dark:text-gray-400">${selectedClass?.name || ''} | ${selectedSbj?.name || ''} | ${weekLabel}</div>
      </div>

      <div>
        <label class="block font-bold mb-1">تاریخ ثبت یادداشت *</label>
        <input type="text" id="note-date" value="۱۴۰۲/۱۲/۰۵" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs font-mono text-gray-900 dark:text-gray-100" />
      </div>

      <div>
        <label class="block font-bold mb-1">متن ملاحظات معلم *</label>
        <textarea id="note-content" rows="3" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100 leading-relaxed" placeholder="شرح وضعیت آموزشی، تلاش یا رفتاری دانش‌آموز..."></textarea>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <input type="checkbox" id="note-[#visible-parent]" checked class="w-4 h-4 text-[#012622] rounded focus:ring-[#E98A15]" />
        <label for="note-[#visible-parent]" class="font-bold cursor-pointer">قابل مشاهده برای اولیا در کارنامه و پیش‌خوان اولیا</label>
      </div>
    `;

    const modal = new Modal({
      title: 'افزودن یادداشت ملاحظات معلم',
      content: form,
      confirmText: 'ثبت یادداشت',
      cancelText: 'انصراف',
      onConfirm: () => {
        const noteDate = (form.querySelector('#note-date') as HTMLInputElement).value.trim();
        const content = (form.querySelector('#note-content') as HTMLTextAreaElement).value.trim();
        const isParentVisible = (form.querySelector('#note-[#visible-parent]') as HTMLInputElement).checked;

        if (!content) {
          showToast({ title: 'متن خالی', message: 'لطفاً متن یادداشت را وارد نمایید.', type: 'warning' });
          return;
        }

        schoolStore.addWeeklyNote({
          organizationId: orgId,
          classId: selectedClassId,
          className: selectedClass?.name || 'کلاس نامشخص',
          subjectId: selectedSubjectId,
          subjectName: selectedSbj?.name || 'درس نامشخص',
          studentId: student.id,
          studentName: student.fullName,
          noteDate: noteDate || '۱۴۰۲/۱۲/۰۵',
          weekLabel,
          authorId: membership.userId,
          authorName: currentUser?.name || membership.organization.name,
          content,
          isParentVisible,
        });

        showToast({ title: 'ثبت شد', message: 'یادداشت معلم با موفقیت ذخیره گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
