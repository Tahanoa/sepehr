/**
 * POLARIS DEDICATED FULL-PAGE EXAM BUILDER PAGE
 * Complete multi-step exam builder with dedicated full-page layout, step workflow,
 * persistent summary panel, full 6-type question editor with reordering/options management,
 * question bank integration, student preview mode, validation engine, and store persistence.
 */

import { OrganizationMembership } from '../../../types/auth';
import {
  Exam,
  ExamDifficulty,
  ExamQuestion,
  ExamStatus,
  ExamType,
  InterruptionPolicy,
  QuestionType,
  ResultReleasePolicy,
  SchoolClass,
  Subject,
} from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { formatNumber } from '../../../utils/formatters';

export function createExamBuilderPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in pb-12' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';

  let availableClasses: SchoolClass[] = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    availableClasses = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const availableSubjects: Subject[] = schoolStore.getSubjects(orgId);
  const allStudents = schoolStore.getStudents(orgId);

  // Check query params for existing exam edit mode (?examId=...)
  const urlParams = new URLSearchParams(window.location.search);
  const existingExamId = urlParams.get('examId');
  const existingExam = existingExamId ? schoolStore.getExams(orgId).find((e) => e.id === existingExamId) : null;

  // Builder State
  let currentStep: 1 | 2 | 3 | 4 = 1;
  let isPreviewMode = false;

  const draftData: {
    id?: string;
    title: string;
    instructions: string;
    subjectId: string;
    subjectName: string;
    gradeLevel: string;
    examType: ExamType;
    difficulty: ExamDifficulty;
    durationMinutes: number;
    maxScore: number;
    passingScore: number;
    examDate: string;
    startTime: string;
    attemptLimit: number;
    resultReleasePolicy: ResultReleasePolicy;
    canReviewAnswers: boolean;
    selectedClassIds: string[];
    excludedStudentIds: string[];
    interruptionPolicy: InterruptionPolicy;
    allowResume: boolean;
    allowBackNavigation: boolean;
    allowUnansweredSubmission: boolean;
    autoSubmitOnTimeout: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    status: ExamStatus;
  } = existingExam
    ? {
        id: existingExam.id,
        title: existingExam.title || '',
        instructions: existingExam.instructions || existingExam.description || '',
        subjectId: existingExam.subjectId || (availableSubjects[0]?.id || ''),
        subjectName: existingExam.subjectName || (availableSubjects[0]?.name || 'درس عمومی'),
        gradeLevel: existingExam.gradeLevel || (availableSubjects[0]?.gradeLevel || 'پایه تحصیلی'),
        examType: existingExam.examType || 'mixed',
        difficulty: existingExam.difficulty || 'medium',
        durationMinutes: existingExam.durationMinutes || 60,
        maxScore: existingExam.maxScore || 20,
        passingScore: existingExam.passingScore || 10,
        examDate: existingExam.examDate || '۱۴۰۳/۰۱/۱۵',
        startTime: existingExam.startTime || '۰۹:۰۰',
        attemptLimit: existingExam.attemptLimit || 1,
        resultReleasePolicy: existingExam.resultReleasePolicy || 'manual',
        canReviewAnswers: existingExam.canReviewAnswers !== false,
        selectedClassIds: existingExam.classIds ? [...existingExam.classIds] : (availableClasses[0] ? [availableClasses[0].id] : []),
        excludedStudentIds: existingExam.excludedStudentIds ? [...existingExam.excludedStudentIds] : [],
        interruptionPolicy: existingExam.interruptionPolicy || 'warn_flag',
        allowResume: existingExam.allowResume !== false,
        allowBackNavigation: existingExam.allowBackNavigation !== false,
        allowUnansweredSubmission: existingExam.allowUnansweredSubmission !== false,
        autoSubmitOnTimeout: existingExam.autoSubmitOnTimeout !== false,
        randomizeQuestions: existingExam.randomizeQuestions || false,
        randomizeOptions: existingExam.randomizeOptions || false,
        status: existingExam.status || 'draft',
      }
    : {
        title: '',
        instructions: '',
        subjectId: availableSubjects[0]?.id || '',
        subjectName: availableSubjects[0]?.name || 'درس عمومی',
        gradeLevel: availableSubjects[0]?.gradeLevel || 'پایه تحصیلی',
        examType: 'mixed',
        difficulty: 'medium',
        durationMinutes: 60,
        maxScore: 20,
        passingScore: 10,
        examDate: '۱۴۰۳/۰۱/۱۵',
        startTime: '۰۹:۰۰',
        attemptLimit: 1,
        resultReleasePolicy: 'manual',
        canReviewAnswers: true,
        selectedClassIds: availableClasses[0] ? [availableClasses[0].id] : [],
        excludedStudentIds: [],
        interruptionPolicy: 'warn_flag',
        allowResume: true,
        allowBackNavigation: true,
        allowUnansweredSubmission: true,
        autoSubmitOnTimeout: true,
        randomizeQuestions: false,
        randomizeOptions: false,
        status: 'draft',
      };

  let questions: ExamQuestion[] = existingExamId ? schoolStore.getExamQuestions(existingExamId) : [];

  const navigateBackToExams = () => {
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exams` }));
  };

  const calculateQuestionsTotalScore = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  const validateExam = (): string[] => {
    const warnings: string[] = [];

    if (!draftData.title.trim()) {
      warnings.push('عنوان آزمون وارد نشده است.');
    }
    if (!draftData.selectedClassIds || draftData.selectedClassIds.length === 0) {
      warnings.push('هیچ کلاسی برای شرکت در آزمون انتخاب نشده است.');
    }
    if (questions.length === 0) {
      warnings.push('هیچ سوالی به این آزمون اضافه نشده است.');
    }

    questions.forEach((q, idx) => {
      const qNum = formatNumber(idx + 1);
      if (!q.prompt.trim() || q.prompt === 'متن سوال جدید را وارد کنید...') {
        warnings.push(`متن سوال شماره ${qNum} وارد نشده یا ناقص است.`);
      }

      if ((q.type === 'single_choice' || q.type === 'mcq') && q.options) {
        if (!q.correctOptionId) {
          warnings.push(`سوال تک‌گزینه‌ای شماره ${qNum} کلید پاسخ صحیح ندارد.`);
        }
      } else if (q.type === 'multiple_select' && q.options) {
        if (!q.correctOptionIds || q.correctOptionIds.length === 0) {
          warnings.push(`سوال چندگزینه‌ای شماره ${qNum} حداقل یک کلید صحیح می‌خواهد.`);
        }
      } else if (q.type === 'true_false') {
        if (q.correctBool === undefined) {
          warnings.push(`سوال صحیح/غلط شماره ${qNum} وضعیت گزینه‌ای مشخص نشده دارد.`);
        }
      }
    });

    const totalQScore = calculateQuestionsTotalScore();
    if (totalQScore !== draftData.maxScore) {
      warnings.push(`مجموع نمرات سوالات (${formatNumber(totalQScore)}) با سقف نمره آزمون (${formatNumber(draftData.maxScore)}) برابر نیست.`);
    }

    return warnings;
  };

  const saveExamToStore = (status: ExamStatus): Exam => {
    const totalQScore = calculateQuestionsTotalScore();

    const examPayload: Omit<Exam, 'id'> = {
      organizationId: orgId,
      title: draftData.title || 'آزمون جدید',
      description: draftData.instructions,
      instructions: draftData.instructions,
      subjectId: draftData.subjectId || 'sbj-1',
      subjectName: draftData.subjectName || 'درس عمومی',
      gradeLevel: draftData.gradeLevel || 'پایه تحصیلی',
      classIds: draftData.selectedClassIds || [],
      excludedStudentIds: draftData.excludedStudentIds || [],
      examDate: draftData.examDate || '۱۴۰۳/۰۱/۱۵',
      startTime: draftData.startTime || '۰۹:۰۰',
      durationMinutes: draftData.durationMinutes || 60,
      maxScore: draftData.maxScore || totalQScore || 20,
      passingScore: draftData.passingScore || 10,
      term: 'term_1',
      status,
      evalType: draftData.examType === 'descriptive' ? 'descriptive' : 'numeric',
      examType: draftData.examType,
      difficulty: draftData.difficulty,
      attemptLimit: draftData.attemptLimit,
      canReviewAnswers: draftData.canReviewAnswers,
      resultReleasePolicy: draftData.resultReleasePolicy,
      allowBackNavigation: draftData.allowBackNavigation,
      allowUnansweredSubmission: draftData.allowUnansweredSubmission,
      autoSubmitOnTimeout: draftData.autoSubmitOnTimeout,
      interruptionPolicy: draftData.interruptionPolicy,
      randomizeQuestions: draftData.randomizeQuestions,
      randomizeOptions: draftData.randomizeOptions,
      ...(currentUser?.id ? { createdByTeacherId: currentUser.id } : {}),
      ...(currentUser?.name ? { createdByTeacherName: currentUser.name } : {}),
    };

    let savedExam: Exam;

    if (draftData.id) {
      const updated = schoolStore.updateExam(draftData.id, examPayload);
      savedExam = updated || schoolStore.addExam(examPayload);
    } else {
      savedExam = schoolStore.addExam(examPayload);
      draftData.id = savedExam.id;
    }

    // Save Questions to Store
    const existingQs = schoolStore.getExamQuestions(savedExam.id);
    existingQs.forEach((q) => schoolStore.deleteExamQuestion(q.id));

    questions.forEach((q) => {
      schoolStore.addExamQuestion({
        ...q,
        examId: savedExam.id,
      });
    });

    return savedExam;
  };

  const render = () => {
    rootWrapper.innerHTML = '';

    // Page Top Header
    const topBar = createElement('div', {
      className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4',
    });

    const titleArea = createElement('div', { className: 'space-y-1' });
    titleArea.innerHTML = `
      <div class="flex items-center gap-2">
        <button type="button" id="btn-back-exams" class="p-1.5 bg-surface-subtle hover:bg-surface-elevated text-foreground rounded-xl transition-all cursor-pointer" title="بازگشت به فهرست آزمون‌ها">
          <svg class="w-5 h-5 dir-rtl-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
        <h2 class="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          ${getDashboardIcon('exam', 'w-6 h-6 text-primary')}
          ${draftData.title ? draftData.title : 'سازنده و طراح جامع آزمون'}
        </h2>
        <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg ${
          draftData.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        }">
          ${draftData.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
        </span>
      </div>
      <p class="text-xs text-muted-foreground mr-9">طراحی، تنظیم بارم‌بندی، سوالات متنی/عینی/تشریحی و بازبینی پیش از انتشار آزمون آنلاین.</p>
    `;

    topBar.appendChild(titleArea);

    // Top Action Buttons
    const actionsRow = createElement('div', { className: 'flex items-center gap-2.5 flex-wrap' });

    const draftBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-border',
      innerHTML: `💾 ذخیره پیش‌نویس`,
    });
    draftBtn.addEventListener('click', () => {
      saveExamToStore('draft');
      showToast({ title: 'ذخیره شد', message: 'پیش‌نویس آزمون در سیستم ذخیره گردید.', type: 'info' });
    });

    const previewToggleBtn = createElement('button', {
      className: `px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
        isPreviewMode ? 'bg-amber-500 text-white' : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/20'
      }`,
      innerHTML: isPreviewMode ? `✏️ خروج از پیش‌نمایش` : `👁️ پیش‌نمایش دانش‌آموز`,
    });
    previewToggleBtn.addEventListener('click', () => {
      isPreviewMode = !isPreviewMode;
      render();
    });

    const publishBtn = createElement('button', {
      className: 'px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `🚀 انتشار آزمون`,
    });
    publishBtn.addEventListener('click', () => {
      const warnings = validateExam();
      if (warnings.length > 0) {
        showToast({ title: 'خطا در انتشار', message: 'لطفاً هشدارهای بخش بازبینی را برطرف نمایید.', type: 'error' });
        currentStep = 4;
        render();
        return;
      }
      saveExamToStore('published');
      showToast({ title: 'منتشر شد', message: 'آزمون با موفقیت منتشر شد و در دسترس دانش‌آموزان قرار گرفت.', type: 'success' });
      navigateBackToExams();
    });

    actionsRow.appendChild(draftBtn);
    actionsRow.appendChild(previewToggleBtn);
    actionsRow.appendChild(publishBtn);
    topBar.appendChild(actionsRow);

    topBar.querySelector('#btn-back-exams')!.addEventListener('click', navigateBackToExams);

    rootWrapper.appendChild(topBar);

    // If Student Preview Mode is active, render rendered student exam view only
    if (isPreviewMode) {
      rootWrapper.appendChild(renderStudentPreviewContainer());
      return;
    }

    // Workflow Steps Bar
    const stepsNav = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-2 shadow-2xs' });
    const stepsList = [
      { num: 1, title: '۱. اطلاعات آزمون' },
      { num: 2, title: '۲. مخاطبان و امنیت' },
      { num: 3, title: '۳. سؤالات و بارم‌بندی' },
      { num: 4, title: '۴. بازبینی و انتشار' },
    ];

    const stepsRow = createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-extrabold' });
    stepsList.forEach((s) => {
      const isCurrent = currentStep === s.num;
      const btn = createElement('button', {
        className: `py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
          isCurrent ? 'bg-primary text-primary-foreground shadow-2xs' : 'bg-surface-subtle text-foreground hover:bg-surface-elevated'
        }`,
        textContent: s.title,
      });
      btn.addEventListener('click', () => {
        currentStep = s.num as any;
        render();
      });
      stepsRow.appendChild(btn);
    });
    stepsNav.appendChild(stepsRow);
    rootWrapper.appendChild(stepsNav);

    // Main 2-Column Grid: Form Content + Persistent Summary Sidebar
    const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' });

    // Column 1 & 2: Active Step View
    const contentArea = createElement('div', { className: 'lg:col-span-2 space-y-6' });

    if (currentStep === 1) {
      contentArea.appendChild(renderStep1Form());
    } else if (currentStep === 2) {
      contentArea.appendChild(renderStep2Form());
    } else if (currentStep === 3) {
      contentArea.appendChild(renderStep3QuestionsEditor());
    } else if (currentStep === 4) {
      contentArea.appendChild(renderStep4ReviewAndPublish());
    }

    // Step Navigation Controls Footer
    const navFooter = createElement('div', { className: 'flex items-center justify-between pt-4 border-t border-border' });

    const prevStepBtn = createElement('button', {
      className: `px-5 py-2 bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs font-bold rounded-xl transition-all border border-border cursor-pointer ${
        currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
      }`,
      textContent: '➔ گام قبلی',
    });
    prevStepBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep = (currentStep - 1) as any;
        render();
      }
    });

    const nextStepBtn = createElement('button', {
      className: `px-5 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition-all cursor-pointer ${
        currentStep === 4 ? 'hidden' : ''
      }`,
      textContent: 'گام بعدی ⬅',
    });
    nextStepBtn.addEventListener('click', () => {
      if (currentStep < 4) {
        if (currentStep === 1 && !draftData.title.trim()) {
          showToast({ title: 'عنوان الزامی', message: 'لطفاً عنوان آزمون را وارد نمایید.', type: 'warning' });
          return;
        }
        currentStep = (currentStep + 1) as any;
        render();
      }
    });

    navFooter.appendChild(prevStepBtn);
    navFooter.appendChild(nextStepBtn);
    contentArea.appendChild(navFooter);

    // Column 3: Persistent Summary Sidebar
    const summarySidebar = renderPersistentSummarySidebar();

    mainGrid.appendChild(contentArea);
    mainGrid.appendChild(summarySidebar);

    rootWrapper.appendChild(mainGrid);
  };

  // --- STEP 1: INFORMATION FORM ---
  const renderStep1Form = () => {
    const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-4 text-xs dir-rtl' });

    card.innerHTML = `
      <div class="pb-3 border-b border-border">
        <h3 class="font-extrabold text-sm text-primary">گام ۱ — اطلاعات پایه و عنوان آزمون</h3>
        <p class="text-[11px] text-muted-foreground">مشخصات کلی، عنوان، درس مرتبط و قوانین زمانی آزمون را تعیین کنید.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block font-bold mb-1 text-foreground">عنوان آزمون *</label>
          <input type="text" id="bld-title" value="${draftData.title}" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-extrabold text-foreground focus:bg-surface-elevated transition-all" placeholder="مثال: آزمون جامع حسابان ۲ — فصل مشتق و کاربردها" />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-bold mb-1 text-foreground">توضیحات و راهنمای شرکت در آزمون</label>
          <textarea id="bld-instructions" rows="3" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground focus:bg-surface-elevated transition-all" placeholder="توضیحات لازم درباره‌ی بارم‌بندی، فرمول‌ها یا نکات کلیدی پیش از شروع آزمون...">${draftData.instructions}</textarea>
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">درس مرتبط *</label>
          <select id="bld-subject" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-foreground">
            ${availableSubjects.map((s) => `<option value="${s.id}" ${draftData.subjectId === s.id ? 'selected' : ''}>${s.name} (${s.gradeLevel})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">نوع آزمون *</label>
          <select id="bld-examType" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground">
            <option value="quiz" ${draftData.examType === 'quiz' ? 'selected' : ''}>کوییز کلاسی</option>
            <option value="practice" ${draftData.examType === 'practice' ? 'selected' : ''}>آزمون تمرینی و خودسنجی</option>
            <option value="midterm" ${draftData.examType === 'midterm' ? 'selected' : ''}>آزمون میان‌ترم</option>
            <option value="final" ${draftData.examType === 'final' ? 'selected' : ''}>امتحان پایان‌ترم</option>
            <option value="objective" ${draftData.examType === 'objective' ? 'selected' : ''}>تست چهارگزینه‌ای (عینی)</option>
            <option value="descriptive" ${draftData.examType === 'descriptive' ? 'selected' : ''}>آزمون تشریحی</option>
            <option value="mixed" ${draftData.examType === 'mixed' ? 'selected' : ''}>ترکیبی (تستی + تشریحی)</option>
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">سطح دشواری</label>
          <select id="bld-difficulty" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground">
            <option value="easy" ${draftData.difficulty === 'easy' ? 'selected' : ''}>ساده</option>
            <option value="medium" ${draftData.difficulty === 'medium' ? 'selected' : ''}>متوسط</option>
            <option value="hard" ${draftData.difficulty === 'hard' ? 'selected' : ''}>دشوار / کنکوری</option>
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">مدت زمان آزمون (دقیقه) *</label>
          <input type="number" id="bld-duration" min="5" max="300" value="${draftData.durationMinutes}" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-mono font-bold text-foreground" />
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">سقف نمره کلی آزمون *</label>
          <input type="number" id="bld-maxScore" min="1" max="100" value="${draftData.maxScore}" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-mono font-bold text-foreground" />
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">نمره حد قبولی</label>
          <input type="number" id="bld-passingScore" min="0" max="100" value="${draftData.passingScore}" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-mono text-foreground" />
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">تاریخ برگزاری *</label>
          <input type="text" id="bld-date" value="${draftData.examDate}" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-mono text-foreground" />
        </div>

        <div>
          <label class="block font-bold mb-1 text-foreground">سیاست انتشار کارنامه</label>
          <select id="bld-release" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-foreground">
            <option value="immediate" ${draftData.resultReleasePolicy === 'immediate' ? 'selected' : ''}>بلافاصله پس از تحویل</option>
            <option value="manual" ${draftData.resultReleasePolicy === 'manual' ? 'selected' : ''}>بررسی و انتشار دستی توسط معلم</option>
          </select>
        </div>

        <div class="sm:col-span-2 pt-2 border-t border-border flex items-center gap-2">
          <input type="checkbox" id="bld-review" ${draftData.canReviewAnswers ? 'checked' : ''} class="w-4 h-4 rounded text-primary" />
          <label for="bld-review" class="font-bold text-foreground cursor-pointer">دانش‌آموز می‌تواند پاسخ‌های خود را پیش از تحویل نهایی مرور کند.</label>
        </div>
      </div>
    `;

    const syncInputs = () => {
      draftData.title = (card.querySelector('#bld-title') as HTMLInputElement).value;
      draftData.instructions = (card.querySelector('#bld-instructions') as HTMLTextAreaElement).value;
      draftData.subjectId = (card.querySelector('#bld-subject') as HTMLSelectElement).value;

      const sbj = availableSubjects.find((s) => s.id === draftData.subjectId);
      if (sbj) {
        draftData.subjectName = sbj.name;
        draftData.gradeLevel = sbj.gradeLevel;
      }

      draftData.examType = (card.querySelector('#bld-examType') as HTMLSelectElement).value as ExamType;
      draftData.difficulty = (card.querySelector('#bld-difficulty') as HTMLSelectElement).value as ExamDifficulty;
      draftData.durationMinutes = parseInt((card.querySelector('#bld-duration') as HTMLInputElement).value, 10) || 60;
      draftData.maxScore = parseFloat((card.querySelector('#bld-maxScore') as HTMLInputElement).value) || 20;
      draftData.passingScore = parseFloat((card.querySelector('#bld-passingScore') as HTMLInputElement).value) || 10;
      draftData.examDate = (card.querySelector('#bld-date') as HTMLInputElement).value;
      draftData.resultReleasePolicy = (card.querySelector('#bld-release') as HTMLSelectElement).value as ResultReleasePolicy;
      draftData.canReviewAnswers = (card.querySelector('#bld-review') as HTMLInputElement).checked;

      renderPersistentSummarySidebar();
    };

    card.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', syncInputs);
      el.addEventListener('change', syncInputs);
    });

    return card;
  };

  // --- STEP 2: RECIPIENTS & SECURITY FORM ---
  const renderStep2Form = () => {
    const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-5 text-xs dir-rtl' });

    const recipientStudents = allStudents.filter((s) => draftData.selectedClassIds.includes(s.classId));
    const finalRecipients = recipientStudents.filter((s) => !draftData.excludedStudentIds.includes(s.id));

    card.innerHTML = `
      <div class="pb-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="font-extrabold text-sm text-primary">گام ۲ — تعیین کلاس‌ها، مخاطبان و امنیت جلسه</h3>
          <p class="text-[11px] text-muted-foreground">انتخاب کلاس‌های مجاز، لیست استثنا و قوانین قطع اتصال یا خروج از آزمون.</p>
        </div>
        <span class="px-3 py-1.5 bg-primary text-primary-foreground rounded-xl font-bold font-mono text-xs">
          دریافت‌کنندگان نهایی: ${formatNumber(finalRecipients.length)} نفر
        </span>
      </div>

      <!-- Class Selection -->
      <div class="space-y-2">
        <label class="block font-extrabold text-foreground">کلاس‌های شرکت‌کننده در آزمون *</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${availableClasses
            .map((c) => {
              const isChecked = draftData.selectedClassIds.includes(c.id);
              return `
                <label class="p-3 rounded-xl border ${
                  isChecked ? 'border-primary bg-primary/10' : 'border-border bg-surface-subtle'
                } flex items-center justify-between cursor-pointer hover:border-primary transition-all">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" value="${c.id}" class="cls-chk text-primary rounded" ${isChecked ? 'checked' : ''} />
                    <div>
                      <div class="font-bold text-foreground">${c.name}</div>
                      <div class="text-[10px] text-muted-foreground">${c.gradeLevel}</div>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-card border border-border text-foreground rounded-lg text-[10px] font-mono font-bold">${formatNumber(c.studentCount)} دانش‌آموز</span>
                </label>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Security Policies -->
      <div class="pt-4 border-t border-border space-y-4">
        <h4 class="font-extrabold text-xs text-foreground">تنظیمات امنیتی و رفتار جلسه آزمون:</h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold mb-1 text-foreground">سیاست خروج یا غیرفعال شدن صفحه *</label>
            <select id="cfg-interruption" class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground">
              <option value="warn_flag" ${draftData.interruptionPolicy === 'warn_flag' ? 'selected' : ''}>هشدار به دانش‌آموز + ثبت در گزارش سلامت جلسه</option>
              <option value="warn_continue" ${draftData.interruptionPolicy === 'warn_continue' ? 'selected' : ''}>فقط نمایش هشدار (بدون ثبت گزارش)</option>
              <option value="terminate" ${draftData.interruptionPolicy === 'terminate' ? 'selected' : ''}>توقیف و ارسال خودکار پاسخ‌های ثبت‌شده</option>
            </select>
          </div>

          <div class="space-y-2 pt-1 text-foreground">
            <label class="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" id="cfg-back" ${draftData.allowBackNavigation ? 'checked' : ''} class="w-4 h-4 text-primary rounded" />
              <span>امکان بازگشت به سوالات قبلی</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" id="cfg-autoSubmit" ${draftData.autoSubmitOnTimeout ? 'checked' : ''} class="w-4 h-4 text-primary rounded" />
              <span>تحویل خودکار هنگام اتمام تایمر</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" id="cfg-randQ" ${draftData.randomizeQuestions ? 'checked' : ''} class="w-4 h-4 text-primary rounded" />
              <span>ترتیب تصادفی سوالات (Randomize)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer font-bold">
              <input type="checkbox" id="cfg-randOpt" ${draftData.randomizeOptions ? 'checked' : ''} class="w-4 h-4 text-primary rounded" />
              <span>ترتیب تصادفی گزینه‌ها در تست‌ها</span>
            </label>
          </div>
        </div>
      </div>
    `;

    // Handlers
    card.querySelectorAll('.cls-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const selected = Array.from(card.querySelectorAll('.cls-chk:checked')).map((el) => (el as HTMLInputElement).value);
        draftData.selectedClassIds = selected;
        render();
      });
    });

    const syncSecurity = () => {
      draftData.interruptionPolicy = (card.querySelector('#cfg-interruption') as HTMLSelectElement).value as InterruptionPolicy;
      draftData.allowBackNavigation = (card.querySelector('#cfg-back') as HTMLInputElement).checked;
      draftData.autoSubmitOnTimeout = (card.querySelector('#cfg-autoSubmit') as HTMLInputElement).checked;
      draftData.randomizeQuestions = (card.querySelector('#cfg-randQ') as HTMLInputElement).checked;
      draftData.randomizeOptions = (card.querySelector('#cfg-randOpt') as HTMLInputElement).checked;
    };

    card.querySelectorAll('input[type="checkbox"], select').forEach((el) => {
      el.addEventListener('change', syncSecurity);
    });

    return card;
  };

  // --- STEP 3: QUESTIONS EDITOR (ALL 6 TYPES + REORDERING + OPTIONS MANAGEMENT) ---
  const renderStep3QuestionsEditor = () => {
    const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-5 text-xs dir-rtl' });

    const totalQScore = calculateQuestionsTotalScore();

    const header = createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border' });
    header.innerHTML = `
      <div>
        <h3 class="font-extrabold text-sm text-primary">گام ۳ — ویرایشگر سؤالات و پاسخ‌نامه کلید</h3>
        <p class="text-[11px] text-muted-foreground">طراحی انواع سؤالات تستی، تشریحی، عددی، صحیح/غلط و کوتاه‌پاسخ همراه با تعیین بارم‌بندی.</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-surface-subtle text-foreground border border-border rounded-xl font-bold font-mono text-xs">
          تعداد: ${formatNumber(questions.length)}
        </span>
        <span class="px-3 py-1 ${
          totalQScore === draftData.maxScore ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        } rounded-xl font-bold font-mono text-xs">
          بارم سؤالات: ${formatNumber(totalQScore)} از ${formatNumber(draftData.maxScore)}
        </span>
      </div>
    `;

    // Add Bar
    const addBar = createElement('div', { className: 'p-3 bg-surface-subtle rounded-2xl border border-border space-y-2' });
    addBar.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="font-extrabold text-xs text-foreground">افزودن سؤال جدید به آزمون:</span>
        <button type="button" id="btn-open-question-bank" class="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl text-xs transition-all cursor-pointer">
          📚 انتخاب از بانک سوالات
        </button>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button type="button" data-qtype="single_choice" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ تک‌گزینه‌ای</button>
        <button type="button" data-qtype="multiple_select" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ چندگزینه‌ای</button>
        <button type="button" data-qtype="true_false" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ صحیح / غلط</button>
        <button type="button" data-qtype="short_answer" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ پاسخ کوتاه</button>
        <button type="button" data-qtype="descriptive" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ تشریحی</button>
        <button type="button" data-qtype="numeric" class="btn-add-qtype px-3 py-1.5 bg-card text-card-foreground border border-border rounded-xl font-bold hover:bg-surface-elevated cursor-pointer">+ عددی</button>
      </div>
    `;

    addBar.querySelectorAll('.btn-add-qtype').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qtype = btn.getAttribute('data-qtype') as QuestionType;
        const newQ: ExamQuestion = {
          id: 'q-builder-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
          examId: draftData.id || 'draft-id',
          type: qtype,
          prompt: 'متن سوال جدید را وارد کنید...',
          points: 2,
          ...(qtype === 'single_choice' || qtype === 'multiple_select'
            ? {
                options: [
                  { id: 'opt-1', text: 'گزینه ۱' },
                  { id: 'opt-2', text: 'گزینه ۲' },
                  { id: 'opt-3', text: 'گزینه ۳' },
                  { id: 'opt-4', text: 'گزینه ۴' },
                ],
              }
            : {}),
          ...(qtype === 'single_choice' ? { correctOptionId: 'opt-1' } : {}),
          ...(qtype === 'multiple_select' ? { correctOptionIds: ['opt-1'] } : {}),
          ...(qtype === 'true_false' ? { correctBool: true } : {}),
          ...(qtype === 'numeric' ? { numericTarget: 10, numericTolerance: 0 } : {}),
        };

        questions.push(newQ);
        render();
      });
    });

    addBar.querySelector('#btn-open-question-bank')!.addEventListener('click', () => {
      openQuestionBankModal();
    });

    // Question List
    const qListContainer = createElement('div', { className: 'space-y-4' });

    if (questions.length === 0) {
      qListContainer.innerHTML = `<div class="p-8 text-center bg-surface-subtle rounded-2xl border border-dashed border-border text-muted-foreground">هنوز سوالی اضافه نشده است. از نوع‌های بالا یا بانک سوالات برای افزودن استفاده کنید.</div>`;
    } else {
      questions.forEach((q, idx) => {
        const qCard = createElement('div', { className: 'p-4 bg-surface-subtle rounded-2xl border border-border space-y-3' });

        qCard.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-extrabold font-mono">${formatNumber(idx + 1)}</span>
              <span class="font-extrabold text-xs text-foreground">
                ${
                  q.type === 'single_choice' ? 'سؤال تک‌گزینه‌ای (MCQ)' :
                  q.type === 'multiple_select' ? 'سؤال چندگزینه‌ای' :
                  q.type === 'true_false' ? 'سؤال صحیح / غلط' :
                  q.type === 'short_answer' ? 'سؤال پاسخ کوتاه' :
                  q.type === 'numeric' ? 'سؤال عددی' : 'سؤال تشریحی'
                }
              </span>
            </div>

            <!-- Actions: Move Up, Move Down, Duplicate, Delete -->
            <div class="flex items-center gap-1.5">
              <button type="button" class="btn-move-up p-1.5 bg-card text-card-foreground border border-border rounded-lg font-bold hover:bg-surface-elevated ${idx === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}" title="انتقال به بالا">⬆️</button>
              <button type="button" class="btn-move-down p-1.5 bg-card text-card-foreground border border-border rounded-lg font-bold hover:bg-surface-elevated ${idx === questions.length - 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}" title="انتقال به پایین">⬇️</button>

              <label class="font-bold text-[11px] text-muted-foreground mr-2">بارم:</label>
              <input type="number" min="0.5" max="50" step="0.5" value="${q.points}" class="q-points-input w-16 bg-surface border border-border rounded-lg text-center font-mono font-bold py-1 text-xs text-foreground" />

              <button type="button" class="btn-dup-q p-1.5 bg-card text-card-foreground border border-border rounded-lg font-bold hover:bg-surface-elevated cursor-pointer" title="کپی سوال">📋</button>
              <button type="button" class="btn-del-q p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg font-bold hover:bg-rose-500/20 cursor-pointer" title="حذف سوال">🗑️</button>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-1 text-foreground">متن سؤال *</label>
            <textarea class="q-prompt-input w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground" rows="2">${q.prompt}</textarea>
          </div>

          <!-- Type Specific Editors -->
          ${(q.type === 'single_choice' || q.type === 'multiple_select' || q.type === 'mcq') && q.options ? `
            <div class="space-y-2 pt-2 border-t border-border">
              <div class="flex items-center justify-between">
                <label class="font-bold text-foreground">گزینه‌ها و تعیین پاسخ صحیح کلید:</label>
                <button type="button" class="btn-add-opt px-2.5 py-1 bg-card text-card-foreground border border-border hover:bg-surface-elevated rounded-lg text-[11px] font-bold cursor-pointer">+ افزودن گزینه</button>
              </div>

              <div class="space-y-2">
                ${q.options
                  .map((opt, oIdx) => `
                    <div class="flex items-center gap-2">
                      <input type="${q.type === 'multiple_select' ? 'checkbox' : 'radio'}" name="correct-q-${q.id}" value="${opt.id}" class="q-correct-opt text-primary" ${
                        q.type === 'multiple_select'
                          ? (q.correctOptionIds || []).includes(opt.id) ? 'checked' : ''
                          : q.correctOptionId === opt.id ? 'checked' : ''
                      } />
                      <input type="text" value="${opt.text}" data-opt-idx="${oIdx}" class="q-opt-text w-full bg-surface border border-border rounded-xl p-2 text-xs text-foreground" />
                      <button type="button" data-opt-idx="${oIdx}" class="btn-remove-opt p-1.5 text-rose-600 dark:text-rose-400 hover:opacity-80 bg-rose-500/10 rounded-lg cursor-pointer" title="حذف گزینه">✖</button>
                    </div>
                  `)
                  .join('')}
              </div>
            </div>
          ` : ''}

          ${q.type === 'true_false' ? `
            <div class="flex items-center gap-4 pt-2 border-t border-border">
              <span class="font-bold text-foreground">پاسخ صحیح کلید:</span>
              <label class="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">
                <input type="radio" name="tf-${q.id}" value="true" class="q-tf-opt text-primary" ${q.correctBool === true ? 'checked' : ''} />
                <span>صحیح (درست)</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer font-bold text-rose-600 dark:text-rose-400">
                <input type="radio" name="tf-${q.id}" value="false" class="q-tf-opt text-primary" ${q.correctBool === false ? 'checked' : ''} />
                <span>غلط (نادرست)</span>
              </label>
            </div>
          ` : ''}

          ${q.type === 'numeric' ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <label class="block font-bold mb-1 text-foreground">پاسخ عددی صحیح *</label>
                <input type="number" step="any" value="${q.numericTarget ?? 0}" class="q-num-target w-full bg-surface border border-border rounded-xl p-2 text-xs font-mono font-bold text-foreground" />
              </div>
              <div>
                <label class="block font-bold mb-1 text-foreground">حد خطای مجاز (تولرانس ±)</label>
                <input type="number" step="any" value="${q.numericTolerance ?? 0}" class="q-num-tol w-full bg-surface border border-border rounded-xl p-2 text-xs font-mono text-foreground" />
              </div>
            </div>
          ` : ''}

          ${q.type === 'short_answer' || q.type === 'descriptive' ? `
            <div class="pt-2 border-t border-border space-y-1">
              <label class="block font-bold text-foreground">پاسخ مرجع / راهنمای تصحیح استاد:</label>
              <textarea class="q-ref-input w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground" rows="2" placeholder="پاسخ کامل یا کلیدواژه‌های کلیدی تصحیح...">${q.referenceAnswer || ''}</textarea>
            </div>
          ` : ''}
        `;

        // Card Handlers
        const promptInput = qCard.querySelector('.q-prompt-input') as HTMLTextAreaElement;
        promptInput.addEventListener('input', () => { q.prompt = promptInput.value; });

        const pointsInput = qCard.querySelector('.q-points-input') as HTMLInputElement;
        pointsInput.addEventListener('input', () => {
          q.points = parseFloat(pointsInput.value) || 1;
          renderPersistentSummarySidebar();
        });

        // Reordering
        const moveUpBtn = qCard.querySelector('.btn-move-up');
        if (moveUpBtn && idx > 0) {
          moveUpBtn.addEventListener('click', () => {
            const temp = questions[idx - 1]!;
            questions[idx - 1] = questions[idx]!;
            questions[idx] = temp;
            render();
          });
        }

        const moveDownBtn = qCard.querySelector('.btn-move-down');
        if (moveDownBtn && idx < questions.length - 1) {
          moveDownBtn.addEventListener('click', () => {
            const temp = questions[idx + 1]!;
            questions[idx + 1] = questions[idx]!;
            questions[idx] = temp;
            render();
          });
        }

        qCard.querySelector('.btn-dup-q')!.addEventListener('click', () => {
          const dup: ExamQuestion = {
            ...JSON.parse(JSON.stringify(q)),
            id: 'q-builder-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
            prompt: q.prompt + ' (کپی)',
          };
          questions.splice(idx + 1, 0, dup);
          render();
        });

        qCard.querySelector('.btn-del-q')!.addEventListener('click', () => {
          if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
            questions.splice(idx, 1);
            render();
          }
        });

        // Options Management
        const addOptBtn = qCard.querySelector('.btn-add-opt');
        if (addOptBtn) {
          addOptBtn.addEventListener('click', () => {
            if (!q.options) q.options = [];
            const newOptId = 'opt-' + (q.options.length + 1);
            q.options.push({ id: newOptId, text: `گزینه ${q.options.length + 1}` });
            render();
          });
        }

        qCard.querySelectorAll('.q-opt-text').forEach((optInput) => {
          optInput.addEventListener('input', (e) => {
            const oIdx = parseInt((e.target as HTMLElement).getAttribute('data-opt-idx')!, 10);
            if (q.options && q.options[oIdx]) {
              q.options[oIdx]!.text = (e.target as HTMLInputElement).value;
            }
          });
        });

        qCard.querySelectorAll('.btn-remove-opt').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const oIdx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-opt-idx')!, 10);
            if (q.options && q.options.length > 2) {
              q.options.splice(oIdx, 1);
              render();
            } else {
              showToast({ title: 'محدودیت', message: 'هر سوال تستی باید حداقل ۲ گزینه داشته باشد.', type: 'warning' });
            }
          });
        });

        qCard.querySelectorAll('.q-correct-opt').forEach((chk) => {
          chk.addEventListener('change', () => {
            if (q.type === 'multiple_select') {
              const selectedOpts = Array.from(qCard.querySelectorAll('.q-correct-opt:checked')).map((el) => (el as HTMLInputElement).value);
              q.correctOptionIds = selectedOpts;
            } else {
              q.correctOptionId = (chk as HTMLInputElement).value;
            }
          });
        });

        qCard.querySelectorAll('.q-tf-opt').forEach((tf) => {
          tf.addEventListener('change', () => {
            q.correctBool = (tf as HTMLInputElement).value === 'true';
          });
        });

        const numTarget = qCard.querySelector('.q-num-target') as HTMLInputElement;
        if (numTarget) {
          numTarget.addEventListener('input', () => { q.numericTarget = parseFloat(numTarget.value) || 0; });
        }

        const numTol = qCard.querySelector('.q-num-tol') as HTMLInputElement;
        if (numTol) {
          numTol.addEventListener('input', () => { q.numericTolerance = parseFloat(numTol.value) || 0; });
        }

        const refInput = qCard.querySelector('.q-ref-input') as HTMLTextAreaElement;
        if (refInput) {
          refInput.addEventListener('input', () => { q.referenceAnswer = refInput.value; });
        }

        qListContainer.appendChild(qCard);
      });
    }

    card.appendChild(header);
    card.appendChild(addBar);
    card.appendChild(qListContainer);

    return card;
  };

  // --- STEP 4: REVIEW & PUBLISH ---
  const renderStep4ReviewAndPublish = () => {
    const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-5 text-xs dir-rtl' });

    const warnings = validateExam();
    const totalQScore = calculateQuestionsTotalScore();

    const assignedClassNames = availableClasses
      .filter((c) => draftData.selectedClassIds.includes(c.id))
      .map((c) => c.name)
      .join('، ');

    card.innerHTML = `
      <div class="pb-3 border-b border-border">
        <h3 class="font-extrabold text-sm text-primary">گام ۴ — بازبینی نهایی و تأیید انتشار</h3>
        <p class="text-[11px] text-muted-foreground">بررسی کامل صحت نمرات، کلید پاسخ‌ها، مخاطبان و آمادگی نهایی جهت انتشار.</p>
      </div>

      ${
        warnings.length > 0
          ? `
        <div class="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl space-y-1.5">
          <div class="font-extrabold text-xs flex items-center gap-1.5">
            <span>⚠️ هشدارهای بررسی صحت داده‌ها پیش از انتشار:</span>
          </div>
          <ul class="list-disc list-inside space-y-1 text-[11px]">
            ${warnings.map((w) => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      `
          : `
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>تمامی پارامترهای آزمون معتبر و بدون خطا بوده و آماده انتشار نهایی می‌باشد.</span>
        </div>
      `
      }

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-subtle p-4 rounded-2xl border border-border text-foreground">
        <div><strong>عنوان آزمون:</strong> ${draftData.title || '—'}</div>
        <div><strong>درس:</strong> ${draftData.subjectName}</div>
        <div><strong>کلاس‌های مخاطب:</strong> ${assignedClassNames || 'هیچ'}</div>
        <div><strong>مدت زمان:</strong> ${formatNumber(draftData.durationMinutes)} دقیقه</div>
        <div><strong>تعداد سوالات:</strong> ${formatNumber(questions.length)} سوال</div>
        <div><strong>مجموع بارم سوالات:</strong> ${formatNumber(totalQScore)} از ${formatNumber(draftData.maxScore)}</div>
        <div><strong>سیاست کارنامه:</strong> ${draftData.resultReleasePolicy === 'immediate' ? 'انتشار بلافاصله' : 'تأیید دستی معلم'}</div>
        <div><strong>سیاست قطع خروج:</strong> ${draftData.interruptionPolicy === 'terminate' ? 'توقیف جلسه' : 'هشدار و بررسی معلم'}</div>
      </div>
    `;

    return card;
  };

  // --- PERSISTENT SUMMARY SIDEBAR ---
  const renderPersistentSummarySidebar = (): HTMLElement => {
    const sidebar = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-4 text-xs dir-rtl h-fit sticky top-4' });

    const totalQScore = calculateQuestionsTotalScore();
    const assignedClassNames = availableClasses
      .filter((c) => draftData.selectedClassIds.includes(c.id))
      .map((c) => c.name)
      .join('، ');

    sidebar.innerHTML = `
      <h3 class="font-extrabold text-xs text-primary pb-2 border-b border-border flex items-center justify-between">
        <span>خلاصه وضعیت آزمون</span>
        <span class="px-2 py-0.5 bg-surface-subtle text-foreground rounded text-[10px] font-mono border border-border">گام ${formatNumber(currentStep)} از ۴</span>
      </h3>

      <div class="space-y-2.5 text-foreground">
        <div>
          <span class="text-muted-foreground block text-[10px]">عنوان:</span>
          <span class="font-bold text-foreground">${draftData.title || 'بدون عنوان'}</span>
        </div>

        <div>
          <span class="text-muted-foreground block text-[10px]">درس مرتبط:</span>
          <span class="font-bold text-foreground">${draftData.subjectName} (${draftData.gradeLevel})</span>
        </div>

        <div>
          <span class="text-muted-foreground block text-[10px]">کلاس‌های مخاطب:</span>
          <span class="font-bold text-foreground">${assignedClassNames || 'انتخاب نشده'}</span>
        </div>

        <div class="pt-2 border-t border-border grid grid-cols-2 gap-2">
          <div>
            <span class="text-muted-foreground block text-[10px]">تعداد سوالات:</span>
            <span class="font-bold text-foreground font-mono text-sm">${formatNumber(questions.length)}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-[10px]">مدت زمان:</span>
            <span class="font-bold text-foreground font-mono text-sm">${formatNumber(draftData.durationMinutes)} دقیقه</span>
          </div>
        </div>

        <div class="pt-2 border-t border-border space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-[10px]">بارم سوالات:</span>
            <span class="font-bold font-mono text-xs ${
              totalQScore === draftData.maxScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }">
              ${formatNumber(totalQScore)} از ${formatNumber(draftData.maxScore)}
            </span>
          </div>
          <div class="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-border">
            <div class="bg-primary h-full" style="width: ${Math.min(100, (totalQScore / (draftData.maxScore || 1)) * 100)}%"></div>
          </div>
        </div>
      </div>
    `;

    return sidebar;
  };

  // --- STUDENT EXAM PREVIEW CONTAINER ---
  const renderStudentPreviewContainer = (): HTMLElement => {
    const previewWrapper = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-6 shadow-md space-y-6 dir-rtl' });

    previewWrapper.innerHTML = `
      <div class="bg-primary text-primary-foreground p-4 rounded-xl flex items-center justify-between">
        <div>
          <span class="text-xs text-brand-accent font-bold">👁️ حالت پیش‌نمایش دانش‌آموز (Student Exam View)</span>
          <h2 class="font-extrabold text-base">${draftData.title || 'عنوان آزمون'} (${draftData.subjectName})</h2>
        </div>
        <div class="bg-primary-hover px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-brand-accent">
          ⏱️ زمان: ${formatNumber(draftData.durationMinutes)} دقیقه | بارم: ${formatNumber(draftData.maxScore)}
        </div>
      </div>

      ${
        draftData.instructions
          ? `
        <div class="p-3.5 bg-surface-subtle border border-border rounded-xl text-xs text-foreground">
          <strong>دستورالعمل آزمون:</strong> ${draftData.instructions}
        </div>
      `
          : ''
      }

      <div class="space-y-6">
        ${questions.length === 0 ? `
          <div class="p-8 text-center text-muted-foreground">سوالی برای پیش‌نمایش وجود ندارد.</div>
        ` : questions.map((q, idx) => `
          <div class="p-5 bg-surface-subtle rounded-2xl border border-border space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <span class="font-extrabold text-xs text-primary">سوال ${formatNumber(idx + 1)} از ${formatNumber(questions.length)}</span>
              <span class="font-bold text-xs bg-surface border border-border px-2 py-0.5 rounded text-foreground">${formatNumber(q.points)} نمره</span>
            </div>
            <p class="font-bold text-sm text-foreground">${q.prompt}</p>

            <!-- Render Question Input without Answers -->
            ${(q.type === 'single_choice' || q.type === 'mcq') && q.options ? `
              <div class="space-y-2 pt-2">
                ${q.options.map((opt) => `
                  <label class="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl cursor-pointer">
                    <input type="radio" name="prev-q-${q.id}" class="text-primary" />
                    <span class="text-xs text-foreground">${opt.text}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}

            ${q.type === 'multiple_select' && q.options ? `
              <div class="space-y-2 pt-2">
                ${q.options.map((opt) => `
                  <label class="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl cursor-pointer">
                    <input type="checkbox" class="text-primary rounded" />
                    <span class="text-xs text-foreground">${opt.text}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}

            ${q.type === 'true_false' ? `
              <div class="flex items-center gap-4 pt-2">
                <label class="p-2.5 bg-card border border-border rounded-xl flex items-center gap-2 cursor-pointer font-bold text-xs text-foreground">
                  <input type="radio" name="prev-tf-${q.id}" />
                  <span>صحیح (درست)</span>
                </label>
                <label class="p-2.5 bg-card border border-border rounded-xl flex items-center gap-2 cursor-pointer font-bold text-xs text-foreground">
                  <input type="radio" name="prev-tf-${q.id}" />
                  <span>غلط (نادرست)</span>
                </label>
              </div>
            ` : ''}

            ${q.type === 'numeric' ? `
              <div class="pt-2">
                <input type="number" step="any" placeholder="پاسخ عددی خود را وارد کنید..." class="w-full max-w-xs bg-surface border border-border rounded-xl p-2.5 text-xs font-mono text-foreground" />
              </div>
            ` : ''}

            ${q.type === 'short_answer' || q.type === 'descriptive' ? `
              <div class="pt-2">
                <textarea rows="3" placeholder="پاسخ کامل خود را بنویسید..." class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground"></textarea>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    return previewWrapper;
  };

  // --- QUESTION BANK MODAL ---
  const openQuestionBankModal = () => {
    const bankItems = schoolStore.getQuestionBank(orgId);
    const selectedBankIds: string[] = [];

    const container = createElement('div', { className: 'space-y-3 text-xs dir-rtl text-foreground' });

    container.innerHTML = `
      <p class="text-muted-foreground text-[11px]">سؤالات مورد نظر را از بانک سوالات مرکز انتخاب کنید. سوالات انتخابی کپی خواهند شد.</p>
      <div class="space-y-2 max-h-64 overflow-y-auto p-2 bg-surface-subtle rounded-xl border border-border">
        ${
          bankItems.length === 0
            ? '<div class="p-4 text-center text-muted-foreground">بانک سوالات در حال حاضر خالی است.</div>'
            : bankItems
                .map(
                  (qb) => `
            <label class="p-2.5 bg-card rounded-xl border border-border flex items-start justify-between cursor-pointer hover:border-primary">
              <div class="flex items-start gap-2">
                <input type="checkbox" value="${qb.id}" class="qb-modal-chk text-primary rounded mt-0.5" />
                <div>
                  <div class="font-bold text-foreground">${qb.prompt}</div>
                  <div class="text-[10px] text-muted-foreground">${qb.subjectName} | بارم: ${formatNumber(qb.points)} نمره</div>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-surface-subtle text-foreground border border-border rounded text-[10px] font-bold">${qb.type}</span>
            </label>
          `
                )
                .join('')
        }
      </div>
    `;

    container.querySelectorAll('.qb-modal-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const val = (chk as HTMLInputElement).value;
        const idx = selectedBankIds.indexOf(val);
        if (idx !== -1) selectedBankIds.splice(idx, 1);
        else selectedBankIds.push(val);
      });
    });

    const modal = new Modal({
      title: 'انتخاب از بانک سوالات مرکز',
      content: container,
      confirmText: 'کپی موارد انتخابی به آزمون',
      cancelText: 'انصراف',
      onConfirm: () => {
        if (selectedBankIds.length === 0) return;

        selectedBankIds.forEach((bankId) => {
          const b = bankItems.find((item) => item.id === bankId);
          if (b) {
            questions.push({
              id: 'q-builder-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
              examId: draftData.id || 'draft-id',
              type: b.type,
              prompt: b.prompt,
              points: b.points,
              ...(b.options ? { options: JSON.parse(JSON.stringify(b.options)) } : {}),
              ...(b.correctOptionId ? { correctOptionId: b.correctOptionId } : {}),
              ...(b.correctOptionIds ? { correctOptionIds: [...b.correctOptionIds] } : {}),
              ...(b.correctBool !== undefined ? { correctBool: b.correctBool } : {}),
              ...(b.numericTarget !== undefined ? { numericTarget: b.numericTarget } : {}),
              ...(b.numericTolerance !== undefined ? { numericTolerance: b.numericTolerance } : {}),
              ...(b.referenceAnswer ? { referenceAnswer: b.referenceAnswer } : {}),
            });
          }
        });

        showToast({ title: 'کپی شد', message: `${formatNumber(selectedBankIds.length)} سوال از بانک به آزمون اضافه شد.`, type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
