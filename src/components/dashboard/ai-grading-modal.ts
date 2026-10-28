/**
 * POLARIS SIMULATED AI DESCRIPTIVE GRADING MODAL
 * Interactive local simulation demonstrating rubric criteria evaluation,
 * reference answer comparison, AI reasoning breakdown, and teacher review/edit workflow.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';
import { RubricCriterion, AIGradingSuggestion } from '../../types/school';

export interface AIGradingModalOptions {
  studentName: string;
  examTitle: string;
  questionPrompt: string;
  studentAnswer: string;
  referenceAnswer: string;
  maxPoints: number;
  rubricCriteria: RubricCriterion[];
  onAcceptGrading: (finalScore: number, feedback: string) => void;
  onClose: () => void;
}

export function createAIGradingModal(options: AIGradingModalOptions): HTMLElement {
  const {
    studentName,
    examTitle,
    questionPrompt,
    studentAnswer,
    referenceAnswer,
    maxPoints,
    rubricCriteria,
    onAcceptGrading,
    onClose,
  } = options;

  const backdrop = createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl animate-fadeIn',
  });

  const dialog = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]',
  });

  // Header
  const header = createElement('div', {
    className: 'bg-[#012622] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="p-2 bg-[#E98A15] text-[#012622] rounded-xl font-bold">
        ${getDashboardIcon('award', 'w-5 h-5')}
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-base font-extrabold text-white">دستیار هوشمند تصحیح سوالات تشریحی (دستیار AI)</h3>
          <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-400/30">شبیه‌سازی دمو</span>
        </div>
        <p class="text-xs text-amber-200">تحلیل هوشمند پاسخ دانش‌آموز بر اساس بارم‌بندی و پاسخ مرجع استاد</p>
      </div>
    </div>
  `;

  const closeBtn = createElement('button', {
    className: 'text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors',
    innerHTML: getDashboardIcon('close', 'w-5 h-5'),
  });
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  // Notice Banner
  const banner = createElement('div', {
    className: 'bg-indigo-50 border-b border-indigo-200 px-5 py-2 text-xs text-indigo-900 flex items-center gap-2 shrink-0',
  });
  banner.innerHTML = `${getDashboardIcon('info', 'w-4 h-4 text-indigo-700 shrink-0')}
    <span><strong>توجه:</strong> نمرات پیشنهادی دستیار هوشمند صرفاً جهت کمک به سرعت تصحیح بوده و پس از بررسی و تایید شما نهایی می‌شوند.</span>`;

  // Body Content
  const body = createElement('div', { className: 'p-6 overflow-y-auto space-y-5 flex-1' });

  // Question & Student Answer Box
  const qBox = createElement('div', { className: 'bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3' });
  qBox.innerHTML = `
    <div class="flex justify-between items-center text-xs text-gray-500 font-semibold border-b border-gray-200 pb-2">
      <span>آزمون: ${examTitle}</span>
      <span>دانش‌آموز: <strong class="text-gray-900">${studentName}</strong></span>
    </div>
    <div>
      <h4 class="text-xs font-bold text-gray-800 mb-1">صورت سوال (سقف نمره: ${maxPoints} نمره):</h4>
      <p class="text-xs text-gray-700 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">${questionPrompt}</p>
    </div>
    <div>
      <h4 class="text-xs font-bold text-gray-800 mb-1">پاسخ مرجع / کلید تصحیح استاد:</h4>
      <p class="text-xs text-gray-700 leading-relaxed bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80">${referenceAnswer || 'پاسخ کلید تعیین نشده است.'}</p>
    </div>
    <div>
      <h4 class="text-xs font-bold text-gray-800 mb-1">پاسخ ثبت‌شده دانش‌آموز:</h4>
      <p class="text-xs text-gray-900 font-medium leading-relaxed bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">${studentAnswer || 'پاسخی درج نشده است.'}</p>
    </div>
  `;
  body.appendChild(qBox);

  // Trigger Action
  const triggerBox = createElement('div', { className: 'text-center py-2' });
  const runAiBtn = createElement('button', {
    className: 'px-6 py-3 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    innerHTML: `<svg class="w-4 h-4 text-[#E98A15] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> <span>تحلیل و تولید پیشنهاد نمره با هوش مصنوعی</span>`,
  });
  triggerBox.appendChild(runAiBtn);
  body.appendChild(triggerBox);

  // Output Results Box (Hidden until clicked)
  const resultBox = createElement('div', { className: 'hidden space-y-4 border-t border-gray-200 pt-4 animate-fade-in-up' });
  body.appendChild(resultBox);

  runAiBtn.addEventListener('click', () => {
    runAiBtn.disabled = true;
    runAiBtn.innerHTML = `<span>در حال تحلیل نگارش، بارم‌بندی و کلید پاسخ...</span>`;

    setTimeout(() => {
      runAiBtn.classList.add('hidden');
      resultBox.classList.remove('hidden');

      // Generate realistic deterministic proposal based on criteria
      let simulatedTotal = 0;
      const breakdown = (rubricCriteria.length > 0 ? rubricCriteria : [
        { id: 'c1', title: 'بیان استدلال و فرمول‌بندی', maxPoints: Math.floor(maxPoints * 0.4), description: 'پوشش مفاهیم پایه' },
        { id: 'c2', title: 'ساده‌سازی و نتیجه نهایی', maxPoints: Math.ceil(maxPoints * 0.6), description: 'دقت در محاسبات' },
      ]).map((c) => {
        const scoreGiven = Math.min(c.maxPoints, Math.floor(c.maxPoints * 0.85 + Math.random() * 0.2 * c.maxPoints));
        simulatedTotal += scoreGiven;
        return {
          criterionTitle: c.title,
          scoreGiven,
          maxPoints: c.maxPoints,
          feedback: `پاسخ دانش‌آموز مفاهیم «${c.title}» را به خوبی شرح داده است.`,
        };
      });

      const suggestion: AIGradingSuggestion = {
        proposedScore: Math.min(maxPoints, simulatedTotal),
        criteriaBreakdown: breakdown,
        reasoningSummary: `دانش‌آموز با استفاده از استدلال منطقی و گام‌به‌گام به پاسخ مرجع استاد نزدیک شده است. خطای جزئی در محاسبات مشاهده می‌شود که ارزش ۱ نمره کسر دارد.`,
      };

      resultBox.innerHTML = `
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              ${getDashboardIcon('award', 'w-4 h-4 text-[#E98A15]')} نتیجه تحلیل هوشمند دمو
            </span>
            <span class="text-sm font-black text-[#012622] bg-white px-3 py-1 rounded-lg border border-amber-300">
              نمره پیشنهادی: ${suggestion.proposedScore} از ${maxPoints}
            </span>
          </div>
          <p class="text-xs text-gray-700 leading-relaxed"><strong>تحلیل کلی دستیار:</strong> ${suggestion.reasoningSummary}</p>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-bold text-gray-800">ریز نمرات بر اساس معاییر بارم‌بندی (Rubric):</h4>
          <div class="space-y-2">
            ${suggestion.criteriaBreakdown
              .map(
                (crit) => `
              <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-gray-900">${crit.criterionTitle}:</span>
                  <span class="text-gray-600 me-2"> ${crit.feedback}</span>
                </div>
                <span class="font-bold text-[#012622] shrink-0">${crit.scoreGiven} / ${crit.maxPoints}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="space-y-3 border-t border-gray-200 pt-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1 text-right">
              <label class="block text-xs font-bold text-gray-700">نمره نهایی استاد (قابل ویرایش):</label>
              <input type="number" id="final-teacher-score" max="${maxPoints}" min="0" value="${suggestion.proposedScore}" step="0.5" class="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs font-bold text-[#012622]">
            </div>
            <div class="space-y-1 text-right">
              <label class="block text-xs font-bold text-gray-700">بازخورد آموزشی برای دانش‌آموز:</label>
              <textarea id="final-teacher-feedback" rows="2" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs">${suggestion.reasoningSummary}</textarea>
            </div>
          </div>
        </div>
      `;
    }, 700);
  });

  // Footer Actions
  const footer = createElement('div', {
    className: 'bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between shrink-0',
  });

  const rejectBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors',
    textContent: 'انصراف / رد پیشنهاد',
  });
  rejectBtn.addEventListener('click', onClose);

  const acceptBtn = createElement('button', {
    className: 'px-5 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5',
    innerHTML: `${getDashboardIcon('attendance', 'w-4 h-4')} <span>تایید و ذخیره نمره</span>`,
  });

  acceptBtn.addEventListener('click', () => {
    const scoreInput = dialog.querySelector('#final-teacher-score') as HTMLInputElement;
    const feedbackInput = dialog.querySelector('#final-teacher-feedback') as HTMLTextAreaElement;

    const score = scoreInput ? parseFloat(scoreInput.value) : maxPoints;
    const feedback = feedbackInput ? feedbackInput.value : 'تصحیح توسط دبیر نهایی شد.';

    onAcceptGrading(score, feedback);
    onClose();
  });

  footer.appendChild(rejectBtn);
  footer.appendChild(acceptBtn);

  dialog.appendChild(header);
  dialog.appendChild(banner);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  backdrop.appendChild(dialog);
  return backdrop;
}
