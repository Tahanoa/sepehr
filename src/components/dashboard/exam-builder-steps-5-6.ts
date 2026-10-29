/**
 * POLARIS MULTI-STEP EXAM BUILDER - STEPS 5 & 6
 * Step 5: Security & Exam Configuration Settings
 * Step 6: Review, Validation & Publishing
 */

import { Exam, InterruptionPolicy, ExamQuestion, SchoolClass } from '../../types/school';
import { createElement } from '../../utils/dom';

export function renderExamBuilderStep5(
  draft: Partial<Exam>,
  onUpdate: (updates: Partial<Exam>) => void
): HTMLElement {
  const container = createElement('div', { className: 'space-y-4 text-xs text-gray-800 dir-rtl' });

  container.innerHTML = `
    <div class="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-[#012622]">گام ۵ — تنظیمات امنیتی و رفتار جلسه آزمون</h3>
        <p class="text-[11px] text-gray-500">پیکربندی قوانین تصادفی‌سازی، ناوبری، قطع اتصال و بازگشت دانش‌آموز.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold mb-1">سیاست خروج یا قطع خروج از آزمون *</label>
          <select id="cfg-interruption" class="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-semibold">
            <option value="warn_flag" ${draft.interruptionPolicy === 'warn_flag' || !draft.interruptionPolicy ? 'selected' : ''}>هشدار و ثبت در گزارش جهت بررسی معلم (پیش‌فرض)</option>
            <option value="warn_continue" ${draft.interruptionPolicy === 'warn_continue' ? 'selected' : ''}>هشدار و اجازه ادامه آزمون بدون ثبت گزارش</option>
            <option value="terminate" ${draft.interruptionPolicy === 'terminate' ? 'selected' : ''}>توقیف و ثبت نهایی خودکار پاسخ‌های تا این لحظه</option>
          </select>
        </div>

        <div>
          <label class="block font-bold mb-1">بازگشت و بازنشانی صفحه</label>
          <select id="cfg-resume" class="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs">
            <option value="true" ${draft.allowResume !== false ? 'selected' : ''}>اجازه ادامه آزمون پس از تازه‌سازی/بازگشت (بدون ریست زمان‌سنج)</option>
            <option value="false" ${draft.allowResume === false ? 'selected' : ''}>عدم امکان بازگشت پس از خروج از صفحه</option>
          </select>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-200 sm:col-span-2">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="cfg-back" ${draft.allowBackNavigation !== false ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
            <label for="cfg-back" class="font-bold cursor-pointer">امکان پیمایش به سوالات قبلی و تغییر پاسخ‌ها فعال باشد</label>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="cfg-unanswered" ${draft.allowUnansweredSubmission !== false ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
            <label for="cfg-unanswered" class="font-bold cursor-pointer">اجازه ثبت نهایی با سوالات بدون پاسخ داده شود</label>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="cfg-autoSubmit" ${draft.autoSubmitOnTimeout !== false ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
            <label for="cfg-autoSubmit" class="font-bold cursor-pointer">تحویل خودکار پاسخ‌ها بلافاصله پس از اتمام زمان‌سنج</label>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="cfg-randQ" ${draft.randomizeQuestions ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
            <label for="cfg-randQ" class="font-bold cursor-pointer">چیدمان تصادفی سوالات برای هر دانش‌آموز (Randomize Questions)</label>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="cfg-randOpt" ${draft.randomizeOptions ? 'checked' : ''} class="w-4 h-4 rounded text-[#012622]" />
            <label for="cfg-randOpt" class="font-bold cursor-pointer">چیدمان تصادفی گزینه‌ها در سوالات تستی (Randomize Options)</label>
          </div>
        </div>
      </div>
    </div>
  `;

  const sync = () => {
    const interruptionPolicy = (container.querySelector('#cfg-interruption') as HTMLSelectElement).value as InterruptionPolicy;
    const allowResume = (container.querySelector('#cfg-resume') as HTMLSelectElement).value === 'true';
    const allowBackNavigation = (container.querySelector('#cfg-back') as HTMLInputElement).checked;
    const allowUnansweredSubmission = (container.querySelector('#cfg-unanswered') as HTMLInputElement).checked;
    const autoSubmitOnTimeout = (container.querySelector('#cfg-autoSubmit') as HTMLInputElement).checked;
    const randomizeQuestions = (container.querySelector('#cfg-randQ') as HTMLInputElement).checked;
    const randomizeOptions = (container.querySelector('#cfg-randOpt') as HTMLInputElement).checked;

    onUpdate({
      interruptionPolicy,
      allowResume,
      allowBackNavigation,
      allowUnansweredSubmission,
      autoSubmitOnTimeout,
      randomizeQuestions,
      randomizeOptions,
    });
  };

  container.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('input', sync);
    el.addEventListener('change', sync);
  });

  return container;
}

export function renderExamBuilderStep6(
  draft: Partial<Exam> & { selectedClassIds?: string[]; excludedStudentIds?: string[] },
  questions: ExamQuestion[],
  assignedClasses: SchoolClass[]
): { element: HTMLElement; warnings: string[] } {
  const container = createElement('div', { className: 'space-y-4 text-xs text-gray-800 dir-rtl' });

  const warnings: string[] = [];

  if (!draft.title) warnings.push('عنوان آزمون وارد نشده است.');
  if (!draft.selectedClassIds || draft.selectedClassIds.length === 0) warnings.push('هیچ کلاسی برای این آزمون انتخاب نشده است.');
  if (questions.length === 0) warnings.push('هیچ سوالی به این آزمون اضافه نشده است.');

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  if (draft.maxScore && totalPoints !== draft.maxScore) {
    warnings.push(`مجموع نمرات سوالات (${totalPoints}) با نمره کلی آزمون (${draft.maxScore}) برابری نمی‌کند.`);
  }

  const classNames = assignedClasses.map((c) => c.name).join('، ');

  container.innerHTML = `
    <div class="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-4">
      <div>
        <h3 class="font-extrabold text-sm text-[#012622]">گام ۶ — بازبینی نهایی و انتشار آزمون</h3>
        <p class="text-[11px] text-gray-500">بررسی کامل مشخصات، سوالات و هشدارهای سیستم پیش از قرارگیری در دسترسی دانش‌آموزان.</p>
      </div>

      ${warnings.length > 0 ? `
        <div class="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl space-y-1">
          <div class="font-extrabold text-xs">⚠️ هشدارهای بررسی پیش از انتشار:</div>
          <ul class="list-disc list-inside space-y-0.5">
            ${warnings.map((w) => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <div class="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl font-bold flex items-center gap-2">
          <span>✅ تمامی پارامترها و بارم‌بندی آزمون معتبر بوده و آماده انتشار است.</span>
        </div>
      `}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div><strong>عنوان آزمون:</strong> ${draft.title || '—'}</div>
        <div><strong>درس:</strong> ${draft.subjectName || '—'}</div>
        <div><strong>کلاس‌های دریافت‌کننده:</strong> ${classNames || '—'}</div>
        <div><strong>مدت زمان:</strong> ${draft.durationMinutes || 60} دقیقه</div>
        <div><strong>تعداد سوالات:</strong> ${questions.length.toLocaleString('fa-IR')} سوال</div>
        <div><strong>مجموع بارم سوالات:</strong> ${totalPoints.toLocaleString('fa-IR')} از ${draft.maxScore || 20}</div>
        <div><strong>سیاست کارنامه:</strong> ${draft.resultReleasePolicy === 'immediate' ? 'انتشار بلافاصله' : 'بررسی و انتشار دستی معلم'}</div>
        <div><strong>سیاست قطع اتصال:</strong> ${draft.interruptionPolicy === 'terminate' ? 'توقیف خودکار' : 'هشدار و بررسی معلم'}</div>
      </div>
    </div>
  `;

  return { element: container, warnings };
}
