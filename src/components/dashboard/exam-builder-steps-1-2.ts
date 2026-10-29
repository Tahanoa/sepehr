/**
 * POLARIS MULTI-STEP EXAM BUILDER - STEPS 1 & 2
 * Step 1: Exam Information & Rules Validation
 * Step 2: Class & Student Selection (Recipients Preview & Exclusions) with dark mode support
 */

import { Exam, ExamType, ExamDifficulty, ResultReleasePolicy, SchoolClass, Student, Subject } from '../../types/school';
import { createElement } from '../../utils/dom';

export interface ExamBuilderDraftData extends Partial<Exam> {
  selectedClassIds: string[];
  excludedStudentIds: string[];
}

export function renderExamBuilderStep1(
  draft: ExamBuilderDraftData,
  subjects: Subject[],
  onUpdate: (updates: Partial<ExamBuilderDraftData>) => void
): HTMLElement {
  const container = createElement('div', { className: 'space-y-5 text-xs text-gray-800 dark:text-gray-200 dir-rtl' });

  container.innerHTML = `
    <div class="bg-gray-50/70 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4">
      <h3 class="font-extrabold text-sm text-[#012622] dark:text-teal-400 flex items-center gap-2">
        گام ۱ — اطلاعات پایه و مشخصات آزمون
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="block font-bold mb-1">عنوان آزمون *</label>
          <input type="text" id="bld-title" value="${draft.title || ''}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-gray-100" placeholder="مثال: آزمون جامع حسابان و هندسه تحلیلی — نوبت دوم" />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-bold mb-1">توضیحات و دستورالعمل‌های آزمون</label>
          <textarea id="bld-instructions" rows="2" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100" placeholder="توضیحات لازم برای دانش‌آموزان پیش از شروع آزمون...">${draft.instructions || ''}</textarea>
        </div>

        <div>
          <label class="block font-bold mb-1">درس انتخابی *</label>
          <select id="bld-subject" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
            ${subjects.map((sb) => `<option value="${sb.id}" ${draft.subjectId === sb.id ? 'selected' : ''}>${sb.name} (${sb.gradeLevel})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1">نوع آزمون *</label>
          <select id="bld-examType" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100">
            <option value="quiz" ${draft.examType === 'quiz' ? 'selected' : ''}>کوییز کلاسی</option>
            <option value="practice" ${draft.examType === 'practice' ? 'selected' : ''}>آزمون تمرینی و خودسنجی</option>
            <option value="midterm" ${draft.examType === 'midterm' ? 'selected' : ''}>آزمون میان‌ترم</option>
            <option value="final" ${draft.examType === 'final' ? 'selected' : ''}>امتحان پایان‌ترم</option>
            <option value="objective" ${draft.examType === 'objective' ? 'selected' : ''}>تست چهارگزینه‌ای (عینی)</option>
            <option value="descriptive" ${draft.examType === 'descriptive' ? 'selected' : ''}>آزمون تشریحی</option>
            <option value="mixed" ${draft.examType === 'mixed' || !draft.examType ? 'selected' : ''}>ترکیبی (تستی + تشریحی)</option>
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1">سطح دشواری</label>
          <select id="bld-difficulty" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100">
            <option value="easy" ${draft.difficulty === 'easy' ? 'selected' : ''}>ساده</option>
            <option value="medium" ${draft.difficulty === 'medium' || !draft.difficulty ? 'selected' : ''}>متوسط</option>
            <option value="hard" ${draft.difficulty === 'hard' ? 'selected' : ''}>دشوار / کنکوری</option>
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1">مدت زمان آزمون (دقیقه) *</label>
          <input type="number" id="bld-duration" min="5" max="300" value="${draft.durationMinutes || 60}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-mono font-bold text-gray-900 dark:text-gray-100" />
        </div>

        <div>
          <label class="block font-bold mb-1">مجموع نمره آزمون *</label>
          <input type="number" id="bld-maxScore" min="1" max="100" value="${draft.maxScore || 20}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-mono font-bold text-gray-900 dark:text-gray-100" />
        </div>

        <div>
          <label class="block font-bold mb-1">نمره قبولی</label>
          <input type="number" id="bld-passingScore" min="0" max="100" value="${draft.passingScore || 10}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-gray-100" />
        </div>

        <div>
          <label class="block font-bold mb-1">تاریخ و ساعت شروع *</label>
          <input type="text" id="bld-date" value="${draft.examDate || '۱۴۰۲/۱۲/۲۵'}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-gray-100" />
        </div>

        <div>
          <label class="block font-bold mb-1">حداکثر تعداد تلاش مجاز</label>
          <input type="number" id="bld-attempts" min="1" max="5" value="${draft.attemptLimit || 1}" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-gray-100" />
        </div>

        <div>
          <label class="block font-bold mb-1">مشاهده کارنامه و پاسخ صحیح</label>
          <select id="bld-release" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
            <option value="immediate" ${draft.resultReleasePolicy === 'immediate' ? 'selected' : ''}>بلافاصله پس از تحویل آزمون</option>
            <option value="manual" ${draft.resultReleasePolicy === 'manual' || !draft.resultReleasePolicy ? 'selected' : ''}>پس از بررسی و انتشار توسط معلم</option>
          </select>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" id="bld-review" ${draft.canReviewAnswers ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
          <label for="bld-review" class="font-bold cursor-pointer">دانش‌آموز می‌تواند پاسخ‌های خود را پیش از ثبت نهایی مرور کند</label>
        </div>
      </div>
    </div>
  `;

  // Attach Input Listeners
  const sync = () => {
    const title = (container.querySelector('#bld-title') as HTMLInputElement).value.trim();
    const instructions = (container.querySelector('#bld-instructions') as HTMLTextAreaElement).value.trim();
    const subjectId = (container.querySelector('#bld-subject') as HTMLSelectElement).value;
    const examType = (container.querySelector('#bld-examType') as HTMLSelectElement).value as ExamType;
    const difficulty = (container.querySelector('#bld-difficulty') as HTMLSelectElement).value as ExamDifficulty;
    const durationMinutes = parseInt((container.querySelector('#bld-duration') as HTMLInputElement).value, 10) || 60;
    const maxScore = parseFloat((container.querySelector('#bld-maxScore') as HTMLInputElement).value) || 20;
    const passingScore = parseFloat((container.querySelector('#bld-passingScore') as HTMLInputElement).value) || 10;
    const examDate = (container.querySelector('#bld-date') as HTMLInputElement).value.trim();
    const attemptLimit = parseInt((container.querySelector('#bld-attempts') as HTMLInputElement).value, 10) || 1;
    const resultReleasePolicy = (container.querySelector('#bld-release') as HTMLSelectElement).value as ResultReleasePolicy;
    const canReviewAnswers = (container.querySelector('#bld-review') as HTMLInputElement).checked;

    const sbj = subjects.find((s) => s.id === subjectId);

    onUpdate({
      title,
      instructions,
      subjectId,
      subjectName: sbj ? sbj.name : 'درس عمومی',
      gradeLevel: sbj ? sbj.gradeLevel : 'پایه تحصیلی',
      examType,
      difficulty,
      durationMinutes,
      maxScore,
      passingScore,
      examDate,
      attemptLimit,
      resultReleasePolicy,
      canReviewAnswers,
    });
  };

  container.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
  });

  return container;
}

export function renderExamBuilderStep2(
  draft: ExamBuilderDraftData,
  availableClasses: SchoolClass[],
  allStudents: Student[],
  onUpdate: (updates: Partial<ExamBuilderDraftData>) => void
): HTMLElement {
  const container = createElement('div', { className: 'space-y-5 text-xs text-gray-800 dark:text-gray-200 dir-rtl' });

  let searchQuery = '';

  const renderContent = () => {
    container.innerHTML = '';

    const selectedClassIds = draft.selectedClassIds || [];
    const excludedStudentIds = draft.excludedStudentIds || [];

    // Filter Students based on selected classes
    const recipientStudents = allStudents.filter((s) => selectedClassIds.includes(s.classId));
    const finalRecipients = recipientStudents.filter((s) => !excludedStudentIds.includes(s.id));

    const card = createElement('div', { className: 'bg-gray-50/70 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4' });

    card.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 class="font-extrabold text-sm text-[#012622] dark:text-teal-400">گام ۲ — تخصیص کلاس‌ها و مخاطبان آزمون</h3>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">آزمون تنها به کلاس‌ها و گروه‌های تحت مسئولیت شما تخصیص می‌یابد.</p>
        </div>
        <span class="px-3 py-1 bg-[#012622] dark:bg-teal-700 text-white rounded-xl font-bold font-mono text-[11px]">
          تعداد دریافت‌کنندگان نهایی: ${finalRecipients.length.toLocaleString('fa-IR')} نفر
        </span>
      </div>

      <!-- Class Selection Grid -->
      <div class="space-y-2">
        <label class="block font-bold">انتخاب کلاس‌های شرکت‌کننده:</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${availableClasses
            .map((c) => {
              const isSelected = selectedClassIds.includes(c.id);
              return `
                <label class="p-3 bg-white dark:bg-gray-800 rounded-xl border ${isSelected ? 'border-[#012622] dark:border-teal-500 bg-[#ECE5F0]/40 dark:bg-teal-950/40' : 'border-gray-200 dark:border-gray-700'} flex items-center justify-between cursor-pointer hover:border-[#012622]">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" value="${c.id}" class="cls-chk text-[#012622] rounded" ${isSelected ? 'checked' : ''} />
                    <div>
                      <div class="font-bold text-gray-900 dark:text-gray-100">${c.name}</div>
                      <div class="text-[10px] text-gray-500 dark:text-gray-400">${c.gradeLevel} | معلم: ${c.homeroomTeacherName}</div>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-mono font-bold">${c.studentCount} دانش‌آموز</span>
                </label>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Student Exclusions Section -->
      ${selectedClassIds.length > 0 ? `
        <div class="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div class="flex items-center justify-between">
            <label class="font-bold">استثنائات دانش‌آموزی (اختیاری):</label>
            <input type="text" id="std-search" value="${searchQuery}" placeholder="جستجوی نام دانش‌آموز..." class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-2.5 py-1 text-xs text-gray-900 dark:text-gray-100" />
          </div>

          <div class="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            ${recipientStudents
              .filter((s) => !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((s) => {
                const isExcluded = excludedStudentIds.includes(s.id);
                return `
                  <label class="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs">
                    <span class="font-semibold text-gray-800 dark:text-gray-200">${s.fullName} (${s.className})</span>
                    <button type="button" data-std-id="${s.id}" class="toggle-exclude-btn px-2.5 py-1 rounded-lg text-[10px] font-bold ${isExcluded ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}">
                      ${isExcluded ? 'استثناء شده (عدم شرکت)' : 'مجاز به شرکت'}
                    </button>
                  </label>
                `;
              })
              .join('')}
          </div>
        </div>
      ` : '<div class="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 rounded-xl text-center text-xs">لطفاً حداقل یک کلاس را انتخاب نمایید.</div>'}
    `;

    // Event Handlers
    card.querySelectorAll('.cls-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const checkedClassIds = Array.from(card.querySelectorAll('.cls-chk:checked')).map((el) => (el as HTMLInputElement).value);
        onUpdate({ selectedClassIds: checkedClassIds });
        renderContent();
      });
    });

    const searchInput = card.querySelector('#std-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        renderContent();
      });
    }

    card.querySelectorAll('.toggle-exclude-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stdId = btn.getAttribute('data-std-id')!;
        const currentEx = [...(draft.excludedStudentIds || [])];
        const idx = currentEx.indexOf(stdId);
        if (idx !== -1) {
          currentEx.splice(idx, 1);
        } else {
          currentEx.push(stdId);
        }
        onUpdate({ excludedStudentIds: currentEx });
        renderContent();
      });
    });

    container.appendChild(card);
  };

  renderContent();
  return container;
}
