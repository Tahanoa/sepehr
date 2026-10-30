import { deleteAction } from '../../../components/dashboard/delete-action';
/**
 * POLARIS EXAMINATIONS & ASSESSMENTS PAGE
 * Exam directory, create/edit exam form, schedule conflict detection for exams,
 * student score entry interface with validation against max score, and draft/published statuses.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Exam, ExamStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createExamsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let selectedTerm = 'all';
  let selectedStatus = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const exams = schoolStore.getExams(orgId);
    const classes = schoolStore.getClasses(orgId);
    const students = schoolStore.getStudents(orgId);

    // Filtering
    const filtered = exams.filter((ex) => {
      const matchTerm = selectedTerm === 'all' || ex.term === selectedTerm;
      const matchStatus = selectedStatus === 'all' || ex.status === selectedStatus;
      return matchTerm && matchStatus;
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('exam', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} امتحانات، ارزشیابی‌ها و نمره‌دهی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `برنامه‌ریزی و مدیریت ${exams.length.toLocaleString('fa-IR')} امتحان، ثبت نمرات کلاسی و بررسی وضعیت انتشار.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ساخت آزمون جدید`,
    });
    addBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exam-builder` }));
    });

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Filter Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3',
    });

    const termSelect = createElement('select', {
      className:
        'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    });
    termSelect.innerHTML = `
      <option value="all" ${selectedTerm === 'all' ? 'selected' : ''}>همه نوبت‌های امتحانی</option>
      <option value="term_1" ${selectedTerm === 'term_1' ? 'selected' : ''}>ترم اول (دی‌ماه)</option>
      <option value="midterm_1" ${selectedTerm === 'midterm_1' ? 'selected' : ''}>میان‌ترم اول</option>
      <option value="term_2" ${selectedTerm === 'term_2' ? 'selected' : ''}>ترم دوم (خردادماه)</option>
      <option value="midterm_2" ${selectedTerm === 'midterm_2' ? 'selected' : ''}>میان‌ترم دوم</option>
    `;
    termSelect.addEventListener('change', (e) => {
      selectedTerm = (e.target as HTMLSelectElement).value;
      render();
    });

    const statusSelect = createElement('select', {
      className:
        'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    });
    statusSelect.innerHTML = `
      <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>همه وضعیت‌های برگزاری</option>
      <option value="scheduled" ${selectedStatus === 'scheduled' ? 'selected' : ''}>برنامه‌ریزی شده</option>
      <option value="grading" ${selectedStatus === 'grading' ? 'selected' : ''}>در حال ثبت نمره</option>
      <option value="completed" ${selectedStatus === 'completed' ? 'selected' : ''}>نهایی شده</option>
      <option value="published" ${selectedStatus === 'published' ? 'selected' : ''}>منتشر شده جهت اولیا</option>
    `;
    statusSelect.addEventListener('change', (e) => {
      selectedStatus = (e.target as HTMLSelectElement).value;
      render();
    });

    toolbar.appendChild(termSelect);
    toolbar.appendChild(statusSelect);

    // Exam Grid Cards
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (filtered.length === 0) {
      const emptyState = createElement('div', {
        className: 'col-span-full bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs',
        textContent: 'امتحانی با فیلترهای انتخابی یافت نشد.',
      });
      grid.appendChild(emptyState);
    } else {
      filtered.forEach((ex) => {
        const card = createElement('div', {
          className:
            'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between',
        });

        let statusBg = 'bg-blue-100 text-blue-900';
        let statusText = 'برنامه‌ریزی شده';

        if (ex.status === 'grading') {
          statusBg = 'bg-amber-100 text-amber-900';
          statusText = 'درحال ورود نمرات';
        } else if (ex.status === 'completed') {
          statusBg = 'bg-emerald-100 text-emerald-900';
          statusText = 'نمرات نهایی شد';
        } else if (ex.status === 'published') {
          statusBg = 'bg-[rgb(var(--theme-primary))] text-white';
          statusText = 'منتشر شده در کارنامه';
        }

        const classNamesStr = ex.classIds
          .map((cid) => classes.find((c) => c.id === cid)?.name)
          .filter(Boolean)
          .join('، ');

        card.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div>
                <h3 class="font-bold text-sm text-gray-900">${ex.title}</h3>
                <div class="text-[11px] text-gray-500 font-semibold">${ex.subjectName} (${ex.gradeLevel})</div>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusBg}">${statusText}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div><strong>تاریخ آزمون:</strong> <span class="font-mono">${ex.examDate}</span></div>
              <div><strong>ساعت شروع:</strong> <span class="font-mono">${ex.startTime} (${ex.durationMinutes} دقیقه)</span></div>
              <div><strong>کلاس‌های شرکت‌کننده:</strong> ${classNamesStr || 'کلیه کلاس‌ها'}</div>
              <div><strong>سقف نمره:</strong> <span class="font-mono font-bold">${ex.evalType === 'descriptive' ? 'ارزشیابی توصیفی' : ex.maxScore}</span></div>
            </div>
          </div>
        `;

        const actionsRow = createElement('div', {
          className: 'pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2 flex-wrap',
        });

        const editBtn = createElement('button', {
          className: 'px-3 py-2 bg-[rgb(var(--theme-subtle))] hover:bg-[rgb(var(--theme-subtle))]/80 text-[rgb(var(--theme-primary))] font-bold rounded-xl transition-all cursor-pointer',
          textContent: '✏️ ویرایش',
        });
        editBtn.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exam-builder?examId=${ex.id}` }));
        });

        const scoreEntryBtn = createElement('button', {
          className:
            'px-3.5 py-2 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer',
          innerHTML: `${getDashboardIcon('award', 'w-4 h-4')} ورود نمرات`,
        });
        scoreEntryBtn.addEventListener('click', () => openScoreEntryModal(ex, students));

        const togglePublishBtn = createElement('button', {
          className: 'px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all cursor-pointer',
          textContent: ex.status === 'published' ? 'خروج از انتشار' : 'انتشار',
        });
        togglePublishBtn.addEventListener('click', () => {
          if(ex.aiSourceName&&!ex.aiReviewed){window.dispatchEvent(new CustomEvent('polaris-navigate',{detail:`/app/${orgId}/exam-builder?examId=${ex.id}`}));return;}
          const newStatus: ExamStatus = ex.status === 'published' ? 'completed' : 'published';
          schoolStore.updateExam(ex.id, { status: newStatus });
          showToast({ title: 'وضعیت انتشار', message: `وضعیت انتشار آزمون تغییر یافت.`, type: 'info' });
          render();
        });

        actionsRow.appendChild(editBtn);
        actionsRow.appendChild(scoreEntryBtn);
        actionsRow.appendChild(togglePublishBtn);

        actionsRow.append(deleteAction('آزمون',()=>schoolStore.deleteExam(ex.id),render));
        card.appendChild(actionsRow);
        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(grid);
  };


  const openScoreEntryModal = (ex: Exam, allStudents: any[]) => {
    const examStudents = allStudents.filter((s) => ex.classIds.includes(s.classId));
    const existingGrades = schoolStore.getGradesForExam(orgId, ex.id);

    const container = createElement('div', { className: 'space-y-4 dir-rtl text-xs text-gray-800 max-h-[60vh] overflow-y-auto p-1' });

    if (examStudents.length === 0) {
      container.innerHTML = `<div class="p-4 bg-gray-50 text-center text-gray-500 rounded-xl">دانش‌آموزی در کلاس‌های این امتحان یافت نشد.</div>`;
    } else {
      const table = createElement('table', { className: 'polaris-table w-full' });
      table.innerHTML = `
        <thead>
          <tr>
            <th>دانش‌آموز</th>
            <th class="text-center">کد</th>
            <th class="text-center">${ex.evalType === 'descriptive' ? 'ارزشیابی توصیفی' : `نمره (سقف: ${ex.maxScore})`}</th>
            <th>بازخورد آموزشی</th>
          </tr>
        </thead>
      `;

      const tbody = createElement('tbody');

      examStudents.forEach((std) => {
        const grd = existingGrades.find((g) => g.studentId === std.id);
        const tr = createElement('tr');

        const stdTd = createElement('td', {
          innerHTML: `
            <div>
              <div class="font-bold text-gray-900">${std.fullName}</div>
              <div class="text-[10px] text-gray-500">${std.className}</div>
            </div>
          `,
        });

        const codeTd = createElement('td', { className: 'text-center font-mono', textContent: std.studentCode });

        const scoreTd = createElement('td', { className: 'text-center' });

        if (ex.evalType === 'descriptive') {
          const select = createElement('select', {
            className: 'bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs score-input',
            attributes: { 'data-std-id': std.id },
          });
          select.innerHTML = `
            <option value="خیلی خوب" ${grd?.descriptiveScore === 'خیلی خوب' ? 'selected' : ''}>خیلی خوب</option>
            <option value="خوب" ${grd?.descriptiveScore === 'خوب' ? 'selected' : ''}>خوب</option>
            <option value="قابل قبول" ${grd?.descriptiveScore === 'قابل قبول' ? 'selected' : ''}>قابل قبول</option>
            <option value="نیاز به تلاش بیشتر" ${grd?.descriptiveScore === 'نیاز به تلاش بیشتر' ? 'selected' : ''}>نیاز به تلاش بیشتر</option>
          `;
          scoreTd.appendChild(select);
        } else {
          const input = createElement('input', {
            className: 'w-20 text-center font-mono font-bold bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs score-input',
            attributes: { type: 'number', step: '0.25', min: '0', max: String(ex.maxScore), value: grd?.score !== undefined ? String(grd.score) : '20', 'data-std-id': std.id },
          });
          scoreTd.appendChild(input);
        }

        const feedbackTd = createElement('td');
        const feedbackInput = createElement('input', {
          className: 'w-full bg-gray-50 border border-gray-300 rounded-lg p-1.5 text-xs feedback-input',
          attributes: { type: 'text', placeholder: 'توضیحات کوتاه...', value: grd?.feedback || '', 'data-std-id': std.id },
        });
        feedbackTd.appendChild(feedbackInput);

        tr.appendChild(stdTd);
        tr.appendChild(codeTd);
        tr.appendChild(scoreTd);
        tr.appendChild(feedbackTd);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.appendChild(table);
    }

    const modal = new Modal({
      title: `ثبت نمرات امتحان: ${ex.title}`,
      content: container,
      confirmText: 'ذخیره نمرات',
      cancelText: 'انصراف',
      onConfirm: () => {
        const scoreInputs = Array.from(container.querySelectorAll('.score-input')) as (HTMLInputElement | HTMLSelectElement)[];
        const feedbackInputs = Array.from(container.querySelectorAll('.feedback-input')) as HTMLInputElement[];

        let hasError = false;

        const gradesToSave = examStudents.map((std) => {
          const scoreEl = scoreInputs.find((el) => el.getAttribute('data-std-id') === std.id);
          const feedbackEl = feedbackInputs.find((el) => el.getAttribute('data-std-id') === std.id);

          const feedbackVal = feedbackEl ? feedbackEl.value.trim() : '';

          if (ex.evalType === 'descriptive') {
            const descVal = scoreEl ? (scoreEl as HTMLSelectElement).value : 'خیلی خوب';
            const gradeItem: any = {
              studentId: std.id,
              descriptiveScore: descVal,
            };
            if (feedbackVal) gradeItem.feedback = feedbackVal;
            return gradeItem;
          } else {
            const numVal = scoreEl ? parseFloat((scoreEl as HTMLInputElement).value) : 0;
            if (isNaN(numVal) || numVal < 0 || numVal > ex.maxScore) {
              hasError = true;
            }
            const gradeItem: any = {
              studentId: std.id,
              score: isNaN(numVal) ? 0 : numVal,
            };
            if (feedbackVal) gradeItem.feedback = feedbackVal;
            return gradeItem;
          }
        });

        if (hasError) {
          showToast({ title: 'خطا در نمره‌دهی', message: `نمرات وارد شده باید بین ۰ و ${ex.maxScore} باشد.`, type: 'error' });
          return;
        }

        schoolStore.saveStudentGrades(orgId, ex.id, gradesToSave);
        showToast({ title: 'ذخیره شد', message: 'نمرات دانش‌آموزان با موفقیت در سیستم ثبت گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
