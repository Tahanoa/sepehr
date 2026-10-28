/**
 * POLARIS TEACHER EXAM BUILDER & AI DESCRIPTIVE GRADING PAGE
 * Exam scheduling, question setup (MCQ & Descriptive with rubrics),
 * student attempt review, and interactive AI descriptive grading simulation trigger.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Exam } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { createAIGradingModal } from '../../../components/dashboard/ai-grading-modal';

import { authService } from '../../../services/auth-service';

export function createTeacherExamsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const exams = schoolStore.getExams(orgId);
  const subjects = schoolStore.getSubjects(orgId);
  const students = schoolStore.getStudents(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('exam', 'w-6 h-6 text-[#012622]')} طراح آزمون‌ها و دستیار تصحیح هوشمند (AI)
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">تعریف آزمون‌های تست آنلاین، تنظیم کلید و بارم‌بندی، و استفاده از دستیار هوشمند در تصحیح سوالات تشریحی.</p>
    `;

    const addBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> تعریف آزمون جدید`,
    });
    addBtn.addEventListener('click', () => openAddExamModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Exams List
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (exams.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">هنوز آزمونی تعریف نشده است.</div>`;
    } else {
      exams.forEach((ex) => {
        const questions = schoolStore.getExamQuestions(ex.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[#012622] bg-[#ECE5F0] px-2.5 py-1 rounded-lg">${ex.subjectName}</span>
              <span class="text-[11px] font-mono text-gray-500">تاریخ: ${ex.examDate} — ${ex.startTime}</span>
            </div>
            <h3 class="font-extrabold text-sm text-gray-900">${ex.title}</h3>
            <div class="text-xs text-gray-600 space-y-1">
              <div><strong>نوع ارزیابی:</strong> ${ex.evalType === 'descriptive' ? 'ارزشیابی توصیفی (کیفی)' : 'آزمون نمره‌ای عددی (۰-۲۰)'}</div>
              <div><strong>تعداد سوالات ثبت‌شده:</strong> <span class="font-mono font-bold">${questions.length} سوال</span></div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <button class="add-q-btn px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer">
              افزودن سوال
            </button>
            <button class="grade-ai-btn px-3.5 py-1.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-[#E98A15]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              دستیار تصحیح AI
            </button>
          </div>
        `;

        const addQBtn = card.querySelector('.add-q-btn') as HTMLButtonElement;
        const gradeAiBtn = card.querySelector('.grade-ai-btn') as HTMLButtonElement;

        addQBtn.addEventListener('click', () => openAddQuestionModal(ex));
        gradeAiBtn.addEventListener('click', () => openAiGradingWorkflow(ex));

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openAddExamModal = () => {
    const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dir-rtl' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">عنوان آزمون *</label>
        <input type="text" id="ex-title" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="مثال: امتحان مستمر حسابان ۲ - فصل مشتق" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">درس انتخابی</label>
          <select id="ex-subjectId" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs">
            ${subjects.map((s) => `<option value="${s.id}">${s.name} (${s.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">نوع سنجش</label>
          <select id="ex-evalType" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs">
            <option value="numeric">عددی (۰ تا ۲۰)</option>
            <option value="descriptive">توصیفی (خیلی خوب، خوب ...)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">تاریخ برگزاری *</label>
          <input type="text" id="ex-date" value="۱۴۰۲/۱۲/۲۵" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
        </div>
        <div>
          <label class="block font-bold mb-1">ساعت شروع *</label>
          <input type="text" id="ex-time" value="۰۹:۰۰" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'تعریف آزمون جدید',
      content: form,
      confirmText: 'ثبت آزمون',
      cancelText: 'انصراف',
      onConfirm: () => {
        const title = (form.querySelector('#ex-title') as HTMLInputElement).value.trim();
        const subjectId = (form.querySelector('#ex-subjectId') as HTMLSelectElement).value;
        const evalType = (form.querySelector('#ex-evalType') as HTMLSelectElement).value as any;
        const examDate = (form.querySelector('#ex-date') as HTMLInputElement).value.trim();
        const startTime = (form.querySelector('#ex-time') as HTMLInputElement).value.trim();

        const sbj = subjects.find((s) => s.id === subjectId) || subjects[0];

        schoolStore.addExam({
          organizationId: orgId,
          title,
          subjectId: sbj ? sbj.id : 'sbj-1',
          subjectName: sbj ? sbj.name : 'درس اصلی',
          gradeLevel: sbj ? sbj.gradeLevel : 'پایه تحصیلی',
          classIds: classes.map((c) => c.id),
          examDate,
          startTime,
          durationMinutes: 60,
          maxScore: 20,
          term: 'term_1',
          status: 'scheduled',
          evalType,
        });

        showToast({ title: 'آزمون ایجاد شد', message: 'آزمون جدید در برنامه قرار گرفت.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openAddQuestionModal = (ex: Exam) => {
    const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dir-rtl' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">نوع سوال *</label>
        <select id="q-type" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
          <option value="mcq">چهارگزینه‌ای (تصحیح خودکار)</option>
          <option value="descriptive" selected>تشریحی (با دستیار تصحیح AI)</option>
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">متن سوال *</label>
        <textarea id="q-prompt" rows="3" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="متن کامل سوال را بنویسید..."></textarea>
      </div>

      <div>
        <label class="block font-bold mb-1">پاسخ کلید / راهنمای تصحیح استاد *</label>
        <textarea id="q-ref" rows="3" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="پاسخ کامل مرجع جهت مقایسه با پاسخ دانش‌آموز..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: `افزودن سوال به آزمون — ${ex.title}`,
      content: form,
      confirmText: 'ذخیره سوال',
      cancelText: 'انصراف',
      onConfirm: () => {
        const type = (form.querySelector('#q-type') as HTMLSelectElement).value as any;
        const prompt = (form.querySelector('#q-prompt') as HTMLTextAreaElement).value.trim();
        const referenceAnswer = (form.querySelector('#q-ref') as HTMLTextAreaElement).value.trim();

        schoolStore.addExamQuestion({
          examId: ex.id,
          type,
          prompt,
          points: 10,
          referenceAnswer,
          rubricCriteria: [
            { id: 'c1', title: 'بیان استدلال و فرمول‌بندی اولیه', maxPoints: 5, description: 'پوشش مفاهیم اولیه' },
            { id: 'c2', title: 'محاسبه دقیق و جواب نهایی', maxPoints: 5, description: 'دقت در محاسبات' },
          ],
        });

        showToast({ title: 'سوال افزوده شد', message: 'سوال جدید به بانک سوالات آزمون اضافه گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openAiGradingWorkflow = (ex: Exam) => {
    const studentSample = students[0];
    const stdName = studentSample ? studentSample.fullName : 'امیرحسین رضایی';

    const aiModal = createAIGradingModal({
      studentName: stdName,
      examTitle: ex.title,
      questionPrompt: 'با استفاده از تعریف مشتق (حد کسر تفاضلی)، مشتق تابع f(x) = 2x^2 + 1 را در نقطه x = a محاسبه و اثبات نمایید.',
      studentAnswer: 'حد f(a+h)-f(a)/h وقتی h->0. جایگذاری کنیم کسر حاصل برابر 4ah + 2h^2 تقسیم بر h می‌شود که پس از ساده‌سازی با h جواب برابر 4a خواهد بود.',
      referenceAnswer: 'حد کسر تفاضلی [f(a+h) - f(a)] / h محاسبه شده و با ساده‌سازی به 4a می‌رسیم.',
      maxPoints: 20,
      rubricCriteria: [
        { id: 'rc1', title: 'فرمول‌بندی صحیح تعریف مشتق', maxPoints: 6, description: 'نوشتن حد تفاضلی' },
        { id: 'rc2', title: 'جای‌گذاری و ساده‌سازی', maxPoints: 7, description: 'فاکتورگیری صحیح' },
        { id: 'rc3', title: 'جواب نهایی و استدلال', maxPoints: 7, description: 'رسیدن به 4a' },
      ],
      onAcceptGrading: (finalScore, feedback) => {
        if (studentSample) {
          schoolStore.saveStudentGrades(orgId, ex.id, [
            { studentId: studentSample.id, score: finalScore, feedback },
          ]);
        }
        showToast({ title: 'نمره تایید شد', message: `نمره ${finalScore} با موفقیت ثبت شد.`, type: 'success' });
        render();
      },
      onClose: () => {
        if (document.body.contains(aiModal)) document.body.removeChild(aiModal);
      },
    });

    document.body.appendChild(aiModal);
  };

  render();
  return rootWrapper;
}
