/**
 * POLARIS STUDENT EXAM PARTICIPATION & QUIZ PAGE
 * Take online MCQ exams with auto-grading against answer key, review descriptive scores and feedback.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { Exam } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createStudentExamsPage(membership: OrganizationMembership): HTMLElement {
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
        ${getDashboardIcon('exam', 'w-6 h-6 text-[#012622]')} آزمون‌های آنلاین و کوییزها
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">شرکت در آزمون‌های چهارگزینه‌ای آنلاین با تصحیح فوری و مشاهده نتایج.</p>
    `;

    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (exams.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">آزمونی در حال حاضر فعال نیست.</div>`;
    } else {
      exams.forEach((ex) => {
        const attempt = currentStudent ? schoolStore.getExamAttempt(ex.id, currentStudent.id) : null;
        const questions = schoolStore.getExamQuestions(ex.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[#012622] bg-[#ECE5F0] px-2.5 py-1 rounded-lg">${ex.subjectName}</span>
              <span class="text-[11px] font-mono text-gray-500">تاریخ: ${ex.examDate}</span>
            </div>
            <h3 class="font-extrabold text-sm text-gray-900">${ex.title}</h3>
            <div class="text-xs text-gray-600 space-y-1">
              <div>مدت زمان: <strong>${ex.durationMinutes} دقیقه</strong></div>
              <div>تعداد سوالات: <strong>${questions.length} سوال</strong></div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="px-2.5 py-1 rounded text-[11px] font-bold ${
              attempt
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-amber-100 text-amber-900'
            }">
              ${attempt ? (attempt.totalScore !== undefined ? `نمره نهایی: ${attempt.totalScore} از ۲۰` : 'آزمون ثبت شد (در انتظار نمره)') : 'آماده شرکت در آزمون'}
            </span>

            <button class="exam-btn px-4 py-1.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              ${attempt ? 'مشاهده پاسخیاب و نمره' : 'ورود به آزمون آنلاین'}
            </button>
          </div>
        `;

        const examBtn = card.querySelector('.exam-btn') as HTMLButtonElement;
        examBtn.addEventListener('click', () => {
          if (attempt) {
            openReviewAttemptModal(ex, attempt);
          } else {
            openTakeExamModal(ex, questions);
          }
        });

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openTakeExamModal = (ex: Exam, questions: any[]) => {
    if (questions.length === 0) {
      showToast({ title: 'اطلاع', message: 'سوالات این آزمون هنوز توسط دبیر بارگذاری نشده است.', type: 'info' });
      return;
    }

    const answers: Record<string, string> = {};

    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    const form = createElement('form', { className: 'space-y-4' });

    questions.forEach((q, idx) => {
      const qBox = createElement('div', { className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2' });
      qBox.innerHTML = `<h4 class="font-bold text-gray-900">سوال ${idx + 1}: ${q.prompt}</h4>`;

      if (q.type === 'mcq' && q.options) {
        const optsGroup = createElement('div', { className: 'space-y-1.5 mt-2' });
        q.options.forEach((opt: any) => {
          const lbl = createElement('label', { className: 'flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100/50' });
          lbl.innerHTML = `
            <input type="radio" name="q-${q.id}" value="${opt.id}" class="text-[#012622] focus:ring-[#E98A15]" />
            <span>${opt.text}</span>
          `;
          const radio = lbl.querySelector('input') as HTMLInputElement;
          radio.addEventListener('change', () => {
            answers[q.id] = opt.id;
          });
          optsGroup.appendChild(lbl);
        });
        qBox.appendChild(optsGroup);
      } else {
        const txtarea = createElement('textarea', {
          className: 'w-full bg-white border border-gray-300 rounded-lg p-2 text-xs',
          attributes: { rows: '3', placeholder: 'پاسخ تشریحی خود را وارد کنید...' },
        });
        txtarea.addEventListener('input', (e) => {
          answers[q.id] = (e.target as HTMLTextAreaElement).value;
        });
        qBox.appendChild(txtarea);
      }

      form.appendChild(qBox);
    });

    content.appendChild(form);

    const modal = new Modal({
      title: `شرکت در آزمون آنلاین — ${ex.title}`,
      content,
      confirmText: 'ثبت نهایی و تحویل آزمون',
      cancelText: 'انصراف',
      onConfirm: () => {
        // Automatic MCQ grading against answer key
        let mcqObtained = 0;
        let mcqMax = 0;

        questions.forEach((q) => {
          if (q.type === 'mcq') {
            mcqMax += q.points || 5;
            if (answers[q.id] === q.correctOptionId) {
              mcqObtained += q.points || 5;
            }
          }
        });

        if (currentStudent) {
          schoolStore.saveExamAttempt({
            organizationId: orgId,
            examId: ex.id,
            studentId: currentStudent.id,
            studentName: currentStudent.fullName,
            mcqAnswers: answers,
            descriptiveAnswers: answers,
            mcqScore: mcqObtained,
            descriptiveScore: 10,
            totalScore: Math.min(20, mcqObtained + 10),
            status: 'submitted',
          });

          showToast({ title: 'آزمون تحویل شد', message: `پاسخ‌های شما با موفقیت ثبت و نمره بخش تست تصحیح شد.`, type: 'success' });
          render();
        }
      },
    });

    modal.open();
  };

  const openReviewAttemptModal = (ex: Exam, attempt: any) => {
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    content.innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5 text-emerald-950">
        <div class="font-extrabold text-sm">کارنامه آزمون: ${ex.title}</div>
        <div>نمره بخش سوالات تست: <strong class="font-mono">${attempt.mcqScore ?? '-'} نمره</strong></div>
        <div>نمره نهایی ثبت شده: <strong class="font-mono">${attempt.totalScore ?? 'در انتظار اعلام'} از ۲۰</strong></div>
        <div>زمان تحویل: <span class="font-mono">${attempt.submittedAt}</span></div>
      </div>
    `;

    const modal = new Modal({
      title: `نتیجه آزمون — ${ex.title}`,
      content,
      confirmText: 'بستن',
    });
    modal.open();
  };

  render();
  return rootWrapper;
}
