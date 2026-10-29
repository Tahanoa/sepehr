import { linkedStudents } from '../../../services/academic-store';
/**
 * POLARIS STUDENT EXAM DASHBOARD, RULES MODAL & EXAM RUNNER
 * Dedicated "آزمون‌های من" area, Persian rules modal acknowledgment, and distraction-minimized exam runner.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Exam, ExamQuestion, StudentExamAttempt } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createStudentExamsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;


  
  const currentStudent = linkedStudents(membership)[0];

  let activeTab: 'available' | 'upcoming' | 'submitted' | 'graded' | 'expired' = 'available';

  const render = () => {
    rootWrapper.innerHTML = '';

    const allExams = schoolStore.getExams(orgId);

    // Filter exams for student's class
    const studentClassId = currentStudent ? currentStudent.classId : '';
    const studentExams = allExams.filter((ex) => {
      const isClassAssigned = ex.classIds.includes(studentClassId);
      const isNotExcluded = !ex.excludedStudentIds || !ex.excludedStudentIds.includes(currentStudent?.id || '');
      return isClassAssigned && isNotExcluded;
    });

    // Categorize
    const categorized = {
      available: studentExams.filter((ex) => {
        const att = currentStudent ? schoolStore.getExamAttempt(ex.id, currentStudent.id) : null;
        return (!att || att.status === 'in_progress') && (ex.status === 'published' || ex.status === 'available');
      }),
      upcoming: studentExams.filter((ex) => ex.status === 'scheduled'),
      submitted: studentExams.filter((ex) => {
        const att = currentStudent ? schoolStore.getExamAttempt(ex.id, currentStudent.id) : null;
        return att && att.status === 'submitted';
      }),
      graded: studentExams.filter((ex) => {
        const att = currentStudent ? schoolStore.getExamAttempt(ex.id, currentStudent.id) : null;
        return att && att.status === 'graded';
      }),
      expired: studentExams.filter((ex) => ex.status === 'archived' || ex.status === 'completed'),
    };

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('exam', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} آزمون‌های من
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">شرکت در آزمون‌های کلاسی، مشاهده زمان‌بندی، کارنامه و پاسخ‌نامه تشریحی.</p>
    `;

    // Tabs
    const tabsNav = createElement('div', { className: 'flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2 text-sm font-semibold' });
    const tabList: { key: typeof activeTab; label: string; count: number }[] = [
      { key: 'available', label: 'آماده شرکت / در حال انجام', count: categorized.available.length },
      { key: 'upcoming', label: 'آزمون‌های پیش‌رو', count: categorized.upcoming.length },
      { key: 'submitted', label: 'تحویل داده شده', count: categorized.submitted.length },
      { key: 'graded', label: 'تصحیح شده / کارنامه', count: categorized.graded.length },
      { key: 'expired', label: 'پایان یافته / آرشیو', count: categorized.expired.length },
    ];

    tabList.forEach((t) => {
      const btn = createElement('button', {
        className: `px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
          activeTab === t.key ? 'bg-[rgb(var(--theme-primary))] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: `${t.label} (${t.count.toLocaleString('fa-IR')})`,
      });
      btn.addEventListener('click', () => {
        activeTab = t.key;
        render();
      });
      tabsNav.appendChild(btn);
    });

    const displayList = categorized[activeTab];
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (displayList.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">آزمونی در این بخش یافت نشد.</div>`;
    } else {
      displayList.forEach((ex) => {
        const attempt = currentStudent ? schoolStore.getExamAttempt(ex.id, currentStudent.id) : null;
        const questions = schoolStore.getExamQuestions(ex.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[rgb(var(--theme-primary))] bg-[rgb(var(--theme-subtle))] px-2.5 py-1 rounded-lg">${ex.subjectName}</span>
              <span class="text-[11px] font-mono text-gray-500">تاریخ: ${ex.examDate}</span>
            </div>
            <h3 class="font-semibold text-sm text-gray-900">${ex.title}</h3>
            <div class="text-xs text-gray-600 space-y-1">
              <div>مدت زمان: <strong>${ex.durationMinutes} دقیقه</strong> | سقف نمره: <strong>${ex.maxScore}</strong></div>
              <div>تعداد سوالات: <strong>${questions.length} سوال</strong></div>
              ${ex.instructions ? `<div class="text-gray-500 text-[11px] line-clamp-1">${ex.instructions}</div>` : ''}
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="px-2.5 py-1 rounded text-[11px] font-bold ${
              attempt
                ? attempt.status === 'graded'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
                : 'bg-blue-100 text-blue-900'
            }">
              ${attempt ? (attempt.totalScore !== undefined ? `نمره: ${attempt.totalScore} از ${ex.maxScore}` : 'در انتظار تصحیح معلم') : 'آماده شرکت'}
            </span>

            <button class="exam-action-btn px-4 py-1.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              ${attempt ? (attempt.status === 'in_progress' ? 'ادامه آزمون' : 'مشاهده کارنامه') : 'ورود به جلسه آزمون'}
            </button>
          </div>
        `;

        card.querySelector('.exam-action-btn')!.addEventListener('click', () => {
          if (attempt && attempt.status !== 'in_progress') {
            openReviewAttemptModal(ex, attempt);
          } else {
            openRulesAndStartModal(ex, questions);
          }
        });

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tabsNav);
    rootWrapper.appendChild(grid);
  };

  const openRulesAndStartModal = (ex: Exam, questions: ExamQuestion[]) => {
    const rulesContainer = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });

    rulesContainer.innerHTML = `
      <div class="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl space-y-1">
        <div class="font-semibold text-amber-950 text-xs">مشخصات آزمون: ${ex.title}</div>
        <div class="text-amber-900">مدت زمان: <strong class="font-mono">${ex.durationMinutes} دقیقه</strong> | سقف نمره: <strong class="font-mono">${ex.maxScore}</strong></div>
      </div>

      <div class="space-y-2">
        <h4 class="font-semibold text-xs text-[rgb(var(--theme-primary))]">لطفاً پیش از شروع آزمون، قوانین زیر را با دقت مطالعه کنید:</h4>
        <ol class="list-decimal list-inside space-y-1.5 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
          <li>آزمون پس از تأیید شروع، زمان‌سنج فعال خواهد شد.</li>
          <li>مدت آزمون محدود است و پس از پایان زمان، پاسخ‌ها به‌صورت خودکار ثبت و ارسال می‌شوند.</li>
          <li>از بستن صفحه آزمون، خروج از محیط آزمون یا تازه‌سازی صفحه خودداری کنید. بسته به سیاست تعریف‌شده برای آزمون، خروج غیرمجاز ممکن است به‌عنوان رویداد ثبت شود یا تلاش آزمون را متوقف کند.</li>
          <li>تلاش برای دسترسی به بخش‌های غیرمجاز یا دست‌کاری محیط آزمون می‌تواند در گزارش فعالیت ثبت شود.</li>
          <li>هر آزمون دارای محدودیت تعداد تلاش است. پس از ثبت نهایی، امکان تغییر پاسخ‌ها وجود ندارد، مگر اینکه سیاست آزمون اجازه تلاش مجدد بدهد.</li>
          <li>در صورت قطع اینترنت یا بروز مشکل فنی، دانش‌آموز باید دستورالعمل اعلام‌شده توسط مدرس را دنبال کند.</li>
          <li>اطلاعات مربوط به رویدادهای آزمون ممکن است برای بررسی آموزشی در اختیار مدرس یا مدیر مجاز قرار گیرد.</li>
          <li>تشخیص خودکار تخلف قطعی نیست و رویدادهای مشکوک باید توسط مسئول مجاز بررسی شوند.</li>
        </ol>
      </div>

      <div class="flex items-center gap-2 pt-2 border-t border-gray-200">
        <input type="checkbox" id="chk-accept-rules" class="w-4 h-4 text-[rgb(var(--theme-primary))] rounded cursor-pointer" />
        <label for="chk-accept-rules" class="font-bold text-gray-900 cursor-pointer">قوانین آزمون را مطالعه کرده‌ام و می‌پذیرم.</label>
      </div>
    `;

    const startBtn = createElement('button', {
      className: 'px-5 py-2.5 bg-[rgb(var(--theme-primary))] text-white text-xs font-bold rounded-xl transition-all opacity-50 cursor-not-allowed',
      textContent: 'شروع آزمون',
    });

    const chk = rulesContainer.querySelector('#chk-accept-rules') as HTMLInputElement;
    chk.addEventListener('change', () => {
      if (chk.checked) {
        startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        startBtn.classList.add('hover:bg-[rgb(var(--theme-hover))]', 'cursor-pointer');
      } else {
        startBtn.classList.add('opacity-50', 'cursor-not-allowed');
        startBtn.classList.remove('hover:bg-[rgb(var(--theme-hover))]', 'cursor-pointer');
      }
    });

    const studentIdVal = currentStudent?.id || 'std-guest';
    const studentNameVal = currentStudent?.fullName || 'دانش‌آموز';
    const classNameVal = currentStudent?.className || 'کلاس اصلی';

    startBtn.addEventListener('click', () => {
      if (!chk.checked) return;
      modal.close();

      // Start Attempt or Resume
      let attempt = schoolStore.getExamAttempt(ex.id, studentIdVal);
      const now = Date.now();

      if (!attempt) {
        attempt = {
          id: 'att-' + now.toString(36),
          organizationId: orgId,
          examId: ex.id,
          studentId: studentIdVal,
          studentName: studentNameVal,
          className: classNameVal,
          startTime: new Date().toLocaleTimeString('fa-IR'),
          startTimestamp: now,
          deadlineTimestamp: now + ex.durationMinutes * 60 * 1000,
          answers: {},
          status: 'in_progress',
          interruptionCount: 0,
        };
        schoolStore.saveExamAttempt(attempt);
      }

      openExamRunner(ex, questions, attempt);
    });

    const modalContainer = createElement('div', { className: 'space-y-4' });
    modalContainer.appendChild(rulesContainer);

    const footerRow = createElement('div', { className: 'flex justify-end gap-2 pt-3 border-t border-gray-100' });
    footerRow.appendChild(startBtn);
    modalContainer.appendChild(footerRow);

    const modal = new Modal({
      title: 'قوانین و راهنمای جلسه آزمون آنلاین',
      content: modalContainer,
      cancelText: 'بازگشت',
    });

    modal.open();
  };

  const openExamRunner = (ex: Exam, questions: ExamQuestion[], attempt: StudentExamAttempt) => {
    // Distraction Minimized Full Screen Runner Container
    const runnerEl = createElement('div', {
      className: 'exam-runner fixed inset-0 z-50 bg-gray-100 flex flex-col dir-rtl overflow-hidden animate-fade-in',
    });

    let currentQIndex = 0;
    runnerEl.setAttribute('role','dialog');runnerEl.setAttribute('aria-modal','true');runnerEl.setAttribute('aria-label','پاسخ‌گویی به آزمون');
    const saveNotice=createElement('p',{className:'workspace-notice',textContent:'پاسخ‌ها در این مرورگر ذخیره می‌شوند؛ پس از پایان، ثبت نهایی را بزنید.',attributes:{role:'status'}});
    const studentAnswers = { ...attempt.answers };

    // Calculate remaining seconds based on stored timestamps
    const calculateRemainingSec = () => {
      const now = Date.now();
      const diff = Math.floor((attempt.deadlineTimestamp - now) / 1000);
      return diff > 0 ? diff : 0;
    };

    let remainingSec = calculateRemainingSec();

    // Top Bar
    const topBar = createElement('div', { className: 'bg-[rgb(var(--theme-primary))] text-white p-4 flex items-center justify-between shadow-md shrink-0' });
    topBar.innerHTML = `
      <div>
        <h2 class="font-semibold text-sm sm:text-base">${ex.title} (${ex.subjectName})</h2>
        <span class="text-xs text-emerald-200">دانش‌آموز: ${attempt.studentName}</span>
      </div>

      <div class="flex items-center gap-4">
        <div class="bg-[rgb(var(--theme-hover))] border border-emerald-500/30 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-2">
          <span>⏱️ زمان باقیمانده:</span>
          <span id="runner-timer">۰۰:۰۰</span>
        </div>

        <button id="btn-submit-exam" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs">
          ثبت نهایی پاسخ‌ها
        </button>
      </div>
    `;

    // Main Content
    const mainBody = createElement('div', { className: 'flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 overflow-hidden' });

    // Question Navigator Sidebar
    const navSidebar = createElement('div', { className: 'bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between h-full' });
    const qNavGrid = createElement('div', { className: 'grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto' });

    const renderNav = () => {
      qNavGrid.innerHTML = '';
      questions.forEach((q, idx) => {
        const isAnswered = studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== '';
        const isCurrent = idx === currentQIndex;

        const btn = createElement('button', {
          className: `py-2 text-xs font-semibold rounded-xl font-mono transition-all cursor-pointer ${
            isCurrent
              ? 'bg-[rgb(var(--theme-primary))] text-white ring-2 ring-[rgb(var(--theme-accent))]'
              : isAnswered
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`,
          textContent: (idx + 1).toLocaleString('fa-IR'),
        });
        btn.addEventListener('click', () => {
          currentQIndex = idx;
          renderCurrentQuestion();
          renderNav();
        });
        qNavGrid.appendChild(btn);
      });
    };

    navSidebar.appendChild(createElement('h3', { className: 'font-semibold text-xs text-gray-900 mb-3', textContent: 'راهنمای سوالات:' }));
    navSidebar.appendChild(qNavGrid);

    // Active Question Box
    const qContentBox = createElement('div', { className: 'md:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs overflow-y-auto flex flex-col justify-between' });

    const renderCurrentQuestion = () => {
      qContentBox.innerHTML = '';
      const q = questions[currentQIndex];

      if (!q) return;

      const qHeader = createElement('div', { className: 'space-y-3' });
      qHeader.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <span class="font-bold text-sm text-[rgb(var(--theme-primary))]">سوال ${(currentQIndex + 1).toLocaleString('fa-IR')} از ${questions.length.toLocaleString('fa-IR')}</span>
          <span class="font-bold text-xs bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] px-2.5 py-1 rounded-lg">بارم: ${q.points} نمره</span>
        </div>
        <p class="font-bold text-sm text-gray-900 leading-relaxed">${q.prompt}</p>
      `;

      const qInputArea = createElement('div', { className: 'my-6' });

      if ((q.type === 'single_choice' || q.type === 'mcq') && q.options) {
        const optsGroup = createElement('div', { className: 'space-y-2' });
        q.options.forEach((opt) => {
          const isSelected = studentAnswers[q.id] === opt.id;
          const lbl = createElement('label', {
            className: `flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              isSelected ? 'bg-[rgb(var(--theme-subtle))]/60 border-[rgb(var(--theme-primary))] font-bold' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`,
          });
          lbl.innerHTML = `
            <input type="radio" name="opt-${q.id}" value="${opt.id}" class="text-[rgb(var(--theme-primary))]" ${isSelected ? 'checked' : ''} />
            <span class="text-xs text-gray-900">${opt.text}</span>
          `;
          lbl.querySelector('input')!.addEventListener('change', () => {
            studentAnswers[q.id] = opt.id;
            attempt.answers = studentAnswers;
            schoolStore.saveExamAttempt(attempt);
            renderNav();
          });
          optsGroup.appendChild(lbl);
        });
        qInputArea.appendChild(optsGroup);
      } else if (q.type === 'multiple_select' && q.options) {
        const optsGroup = createElement('div', { className: 'space-y-2' });
        const currentArr: string[] = Array.isArray(studentAnswers[q.id]) ? studentAnswers[q.id] : [];

        q.options.forEach((opt) => {
          const isSelected = currentArr.includes(opt.id);
          const lbl = createElement('label', {
            className: `flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              isSelected ? 'bg-[rgb(var(--theme-subtle))]/60 border-[rgb(var(--theme-primary))] font-bold' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`,
          });
          lbl.innerHTML = `
            <input type="checkbox" value="${opt.id}" class="text-[rgb(var(--theme-primary))] rounded" ${isSelected ? 'checked' : ''} />
            <span class="text-xs text-gray-900">${opt.text}</span>
          `;
          lbl.querySelector('input')!.addEventListener('change', (e) => {
            const val = (e.target as HTMLInputElement).value;
            let arr = [...(Array.isArray(studentAnswers[q.id]) ? studentAnswers[q.id] : [])];
            if (arr.includes(val)) arr = arr.filter((x) => x !== val);
            else arr.push(val);

            studentAnswers[q.id] = arr;
            attempt.answers = studentAnswers;
            schoolStore.saveExamAttempt(attempt);
            renderNav();
          });
          optsGroup.appendChild(lbl);
        });
        qInputArea.appendChild(optsGroup);
      } else if (q.type === 'true_false') {
        const currentBool = studentAnswers[q.id];
        const group = createElement('div', { className: 'flex items-center gap-4' });
        group.innerHTML = `
          <label class="p-3 bg-gray-50 border rounded-xl flex items-center gap-2 cursor-pointer font-bold ${currentBool === true ? 'bg-emerald-50 border-emerald-400' : ''}">
            <input type="radio" name="tf-${q.id}" value="true" ${currentBool === true ? 'checked' : ''} />
            <span class="text-emerald-900">صحیح (درست)</span>
          </label>
          <label class="p-3 bg-gray-50 border rounded-xl flex items-center gap-2 cursor-pointer font-bold ${currentBool === false ? 'bg-rose-50 border-rose-400' : ''}">
            <input type="radio" name="tf-${q.id}" value="false" ${currentBool === false ? 'checked' : ''} />
            <span class="text-rose-900">غلط (نادرست)</span>
          </label>
        `;
        group.querySelectorAll('input').forEach((r) => {
          r.addEventListener('change', () => {
            studentAnswers[q.id] = r.value === 'true';
            attempt.answers = studentAnswers;
            schoolStore.saveExamAttempt(attempt);
            renderNav();
          });
        });
        qInputArea.appendChild(group);
      } else if (q.type === 'numeric') {
        const val = studentAnswers[q.id] ?? '';
        const input = createElement('input', {
          className: 'w-full max-w-xs bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm font-mono font-bold',
          attributes: { type: 'number', step: 'any', placeholder: 'مقدار عددی پاسخ را وارد کنید...', value: String(val) },
        });
        input.addEventListener('input', () => {
          studentAnswers[q.id] = parseFloat(input.value);
          attempt.answers = studentAnswers;
          schoolStore.saveExamAttempt(attempt);
          renderNav();
        });
        qInputArea.appendChild(input);
      } else {
        // Short Answer / Descriptive
        const val = studentAnswers[q.id] ?? '';
        const txt = createElement('textarea', {
          className: 'w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs',
          attributes: { rows: '4', placeholder: 'پاسخ کامل خود را بنویسید...' },
        });
        txt.value = val;
        txt.addEventListener('input', () => {
          studentAnswers[q.id] = txt.value;
          attempt.answers = studentAnswers;
          schoolStore.saveExamAttempt(attempt);
          renderNav();
        });
        qInputArea.appendChild(txt);
      }

      // Bottom Navigation Buttons
      const btmNav = createElement('div', { className: 'flex items-center justify-between pt-4 border-t border-gray-100' });

      const prevBtn = createElement('button', {
        className: `px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl text-xs cursor-pointer ${currentQIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`,
        textContent: 'قبلی ➔',
      });
      prevBtn.addEventListener('click', () => {
        if (currentQIndex > 0) {
          currentQIndex--;
          renderCurrentQuestion();
          renderNav();
        }
      });

      const nextBtn = createElement('button', {
        className: `px-4 py-2 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold rounded-xl text-xs cursor-pointer ${currentQIndex === questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`,
        textContent: '⬅ بعدی',
      });
      nextBtn.addEventListener('click', () => {
        if (currentQIndex < questions.length - 1) {
          currentQIndex++;
          renderCurrentQuestion();
          renderNav();
        }
      });

      btmNav.appendChild(prevBtn);
      btmNav.appendChild(nextBtn);

      qContentBox.appendChild(qHeader);
      qContentBox.appendChild(qInputArea);
      qContentBox.appendChild(btmNav);
    };

    mainBody.appendChild(qContentBox);
    mainBody.appendChild(navSidebar);

    runnerEl.appendChild(topBar);
    runnerEl.appendChild(saveNotice);
    runnerEl.appendChild(mainBody);

    document.body.appendChild(runnerEl);

    // Timer Countdown Loop
    const timerEl = runnerEl.querySelector('#runner-timer') as HTMLElement;
    const timerInterval = setInterval(() => {
      remainingSec = calculateRemainingSec();
      const m = Math.floor(remainingSec / 60);
      const s = remainingSec % 60;
      const mStr = m < 10 ? '۰' + m.toLocaleString('fa-IR') : m.toLocaleString('fa-IR');
      const sStr = s < 10 ? '۰' + s.toLocaleString('fa-IR') : s.toLocaleString('fa-IR');

      if (timerEl) timerEl.textContent = `${mStr}:${sStr}`;

      if (remainingSec <= 0) {
        clearInterval(timerInterval);
        showToast({ title: 'پایان زمان آزمون', message: 'زمان قانونی آزمون به پایان رسید. پاسخ‌ها ثبت شد.', type: 'warning' });
        finalizeSubmission('timeout');
      }
    }, 1000);

    // Visibility / Interruption Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        attempt.interruptionCount = (attempt.interruptionCount || 0) + 1;
        schoolStore.logExamActivity({
          organizationId: orgId,
          examId: ex.id,
          examTitle: ex.title,
          studentId: attempt.studentId,
          studentName: attempt.studentName,
          attemptId: attempt.id,
          eventType: 'visibility_hidden',
          severity: 'medium',
          description: `دانش‌آموز صفحه آزمون را غیرفعال کرد یا به تب دیگری رفت (تعداد: ${attempt.interruptionCount}).`,
        });

        if (ex.interruptionPolicy === 'terminate') {
          finalizeSubmission('terminated');
        } else {
          showToast({ title: 'هشدار امنیتی جلسه', message: 'خروج از صفحه آزمون ثبت گردید.', type: 'warning' });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const finalizeSubmission = (reason: 'manual' | 'timeout' | 'terminated') => {
      clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Auto Grade Objective Questions
      let totalObtained = 0;

      questions.forEach((q) => {
        const studentAns = studentAnswers[q.id];
        if (q.type === 'single_choice' || q.type === 'mcq') {
          if (studentAns === q.correctOptionId) totalObtained += q.points || 0;
        } else if (q.type === 'multiple_select') {
          const correctArr = q.correctOptionIds || [];
          if (Array.isArray(studentAns) && studentAns.length === correctArr.length && studentAns.every((val) => correctArr.includes(val))) {
            totalObtained += q.points || 0;
          }
        } else if (q.type === 'true_false') {
          if (studentAns === q.correctBool) totalObtained += q.points || 0;
        } else if (q.type === 'numeric') {
          const numVal = parseFloat(studentAns);
          if (!isNaN(numVal) && q.numericTarget !== undefined) {
            const tol = q.numericTolerance || 0;
            if (Math.abs(numVal - q.numericTarget) <= tol) totalObtained += q.points || 0;
          }
        }
      });

      attempt.answers = studentAnswers;
      attempt.mcqScore = totalObtained;
      attempt.totalScore = totalObtained;
      attempt.status = 'submitted';
      attempt.submittedAt = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      attempt.submissionReason = reason;

      schoolStore.saveExamAttempt(attempt);

      if (document.body.contains(runnerEl)) {
        document.body.removeChild(runnerEl);
      }

      showToast({ title: 'تحویل موفقیت‌آمیز', message: 'پاسخ‌های شما با موفقیت تحویل داده شد.', type: 'success' });
      render();
    };

    runnerEl.querySelector('#btn-submit-exam')!.addEventListener('click', () => {
      const answeredCount = Object.keys(studentAnswers).filter((k) => studentAnswers[k] !== undefined && studentAnswers[k] !== '').length;
      const unansweredCount = questions.length - answeredCount;

      if (confirm(`آیا از تحویل نهایی آزمون اطمینان دارید؟\nتعداد سوالات پاسخ داده شده: ${answeredCount}\nتعداد سوالات بدون پاسخ: ${unansweredCount}`)) {
        finalizeSubmission('manual');
      }
    });

    renderCurrentQuestion();
    renderNav();
  };

  const openReviewAttemptModal = (ex: Exam, attempt: StudentExamAttempt) => {
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    content.innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5 text-emerald-950">
        <div class="font-semibold text-sm">کارنامه آزمون: ${ex.title}</div>
        <div>نمره ثبت شده: <strong class="font-mono text-sm">${attempt.totalScore ?? 'در انتظار تصحیح'} از ${ex.maxScore}</strong></div>
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
