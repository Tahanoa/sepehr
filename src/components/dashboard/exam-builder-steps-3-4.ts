/**
 * POLARIS MULTI-STEP EXAM BUILDER - STEPS 3 & 4
 * Step 3: Question Editor (Supports single choice, multiple select, true/false, short answer, descriptive, numeric)
 * Step 4: Reusable Question Bank Integration with dark mode support
 */

import { ExamQuestion, QuestionType } from '../../types/school';
import { createElement } from '../../utils/dom';
import { schoolStore } from '../../services/school-store';
import { showToast } from '../toast';

export function renderExamBuilderStep3(
  questions: ExamQuestion[],
  onChange: (updatedQuestions: ExamQuestion[]) => void
): HTMLElement {
  const container = createElement('div', { className: 'space-y-4 text-xs text-gray-800 dark:text-gray-200 dir-rtl' });

  const totalScore = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  const header = createElement('div', { className: 'flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700' });
  header.innerHTML = `
    <div>
      <h3 class="font-extrabold text-sm text-[#012622] dark:text-teal-400">گام ۳ — ویرایشگر سوالات و کلید تصحیح</h3>
      <p class="text-[11px] text-gray-500 dark:text-gray-400">طراحی انواع سوالات تستی، تشریحی، کوتاه‌پاسخ، عددی و صحیح/غلط با تعیین بارم‌بندی.</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold font-mono text-[11px]">
        تعداد سوالات: ${questions.length.toLocaleString('fa-IR')}
      </span>
      <span class="px-3 py-1 bg-[#012622] dark:bg-teal-700 text-white rounded-xl font-bold font-mono text-[11px]">
        مجموع نمرات: ${totalScore.toLocaleString('fa-IR')}
      </span>
    </div>
  `;

  const addBar = createElement('div', { className: 'flex items-center justify-between p-3 bg-[#ECE5F0]/60 dark:bg-teal-950/40 rounded-xl border border-[#012622]/20 dark:border-teal-800/60' });
  addBar.innerHTML = `
    <span class="font-bold text-xs text-[#012622] dark:text-teal-300">افزودن سوال جدید به آزمون:</span>
    <div class="flex items-center gap-1.5 flex-wrap">
      <button type="button" data-type="single_choice" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ تک‌گزینه‌ای</button>
      <button type="button" data-type="multiple_select" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ چندگزینه‌ای</button>
      <button type="button" data-type="true_false" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ صحیح / غلط</button>
      <button type="button" data-type="short_answer" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ پاسخ کوتاه</button>
      <button type="button" data-type="descriptive" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ تشریحی</button>
      <button type="button" data-type="numeric" class="add-q-type-btn px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">+ عددی</button>
    </div>
  `;

  addBar.querySelectorAll('.add-q-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type') as QuestionType;
      const newQ: ExamQuestion = {
        id: 'q-temp-' + Date.now().toString(36),
        examId: 'draft-exam',
        type,
        prompt: 'متن سوال جدید را وارد کنید...',
        points: 2,
        ...(type === 'single_choice' || type === 'multiple_select' ? {
          options: [
            { id: 'opt-1', text: 'گزینه ۱' },
            { id: 'opt-2', text: 'گزینه ۲' },
            { id: 'opt-3', text: 'گزینه ۳' },
            { id: 'opt-4', text: 'گزینه ۴' },
          ]
        } : {}),
        ...(type === 'single_choice' ? { correctOptionId: 'opt-1' } : {}),
        ...(type === 'multiple_select' ? { correctOptionIds: ['opt-1'] } : {}),
        ...(type === 'true_false' ? { correctBool: true } : {}),
        ...(type === 'numeric' ? { numericTarget: 10, numericTolerance: 0 } : {}),
      };

      onChange([...questions, newQ]);
    });
  });

  const qList = createElement('div', { className: 'space-y-4' });

  if (questions.length === 0) {
    qList.innerHTML = `<div class="p-8 text-center bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">هنوز سوالی به این آزمون اضافه نشده است. از دکمه‌های بالا جهت ایجاد سوال جدید استفاده کنید.</div>`;
  } else {
    questions.forEach((q, idx) => {
      const card = createElement('div', { className: 'p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-3' });

      card.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#012622] dark:bg-teal-700 text-white flex items-center justify-center text-xs font-extrabold font-mono">${(idx + 1).toLocaleString('fa-IR')}</span>
            <span class="font-extrabold text-xs text-[#012622] dark:text-teal-300">
              ${q.type === 'single_choice' ? 'سوال تک‌گزینه‌ای (MCQ)' :
                q.type === 'multiple_select' ? 'سوال چندگزینه‌ای' :
                q.type === 'true_false' ? 'سوال صحیح / غلط' :
                q.type === 'short_answer' ? 'سوال پاسخ کوتاه' :
                q.type === 'numeric' ? 'سوال عددی' : 'سوال تشریحی'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-bold text-[11px] text-gray-600 dark:text-gray-400">بارم / نمره:</label>
            <input type="number" min="0.5" max="20" step="0.5" value="${q.points}" class="q-points-input w-16 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-mono font-bold py-1 text-xs text-gray-900 dark:text-gray-100" />

            <button type="button" class="btn-dup-q p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer" title="کپی سوال">📋</button>
            <button type="button" class="btn-del-q p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-900 bg-rose-50 dark:bg-rose-950/40 rounded-lg cursor-pointer" title="حذف سوال">🗑️</button>
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">متن سوال *</label>
          <textarea class="q-prompt-input w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100" rows="2">${q.prompt}</textarea>
        </div>

        <!-- Answers Config per Question Type -->
        ${(q.type === 'single_choice' || q.type === 'multiple_select' || q.type === 'mcq') && q.options ? `
          <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <label class="block font-bold text-gray-800 dark:text-gray-200">گزینه‌ها و تعیین پاسخ صحیح کلید:</label>
            <div class="space-y-1.5">
              ${q.options.map((opt, oIdx) => `
                <div class="flex items-center gap-2">
                  <input type="${q.type === 'multiple_select' ? 'checkbox' : 'radio'}" name="correct-q-${q.id}" value="${opt.id}" class="q-correct-opt text-[#012622]" ${
                    q.type === 'multiple_select'
                      ? (q.correctOptionIds || []).includes(opt.id) ? 'checked' : ''
                      : q.correctOptionId === opt.id ? 'checked' : ''
                  } />
                  <input type="text" value="${opt.text}" data-opt-idx="${oIdx}" class="q-opt-text w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-1.5 text-xs text-gray-900 dark:text-gray-100" />
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${q.type === 'true_false' ? `
          <div class="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="font-bold">پاسخ صحیح کلید:</span>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="tf-${q.id}" value="true" class="q-tf-opt text-[#012622]" ${q.correctBool === true ? 'checked' : ''} />
              <span class="font-bold text-emerald-800 dark:text-emerald-300">صحیح (درست)</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="tf-${q.id}" value="false" class="q-tf-opt text-[#012622]" ${q.correctBool === false ? 'checked' : ''} />
              <span class="font-bold text-rose-800 dark:text-rose-300">غلط (نادرست)</span>
            </label>
          </div>
        ` : ''}

        ${q.type === 'numeric' ? `
          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label class="block font-bold mb-1">پاسخ عددی صحیح *</label>
              <input type="number" step="any" value="${q.numericTarget ?? 0}" class="q-num-target w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs font-mono font-bold text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label class="block font-bold mb-1">حد خطای مجاز (تولرانس ±)</label>
              <input type="number" step="any" value="${q.numericTolerance ?? 0}" class="q-num-tol w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs font-mono text-gray-900 dark:text-gray-100" />
            </div>
          </div>
        ` : ''}

        ${q.type === 'short_answer' || q.type === 'descriptive' ? `
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <label class="block font-bold">پاسخ نمونه / کلید تصحیح استاد:</label>
            <textarea class="q-ref-input w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" rows="2" placeholder="پاسخ کامل مرجع جهت تصحیح...">${q.referenceAnswer || ''}</textarea>
          </div>
        ` : ''}
      `;

      // Event Listeners for Question Card
      const promptTextarea = card.querySelector('.q-prompt-input') as HTMLTextAreaElement;
      promptTextarea.addEventListener('input', () => {
        q.prompt = promptTextarea.value;
        onChange([...questions]);
      });

      const pointsInput = card.querySelector('.q-points-input') as HTMLInputElement;
      pointsInput.addEventListener('input', () => {
        q.points = parseFloat(pointsInput.value) || 1;
        onChange([...questions]);
      });

      card.querySelectorAll('.q-opt-text').forEach((optInput) => {
        optInput.addEventListener('input', (e) => {
          const oIdx = parseInt((e.target as HTMLElement).getAttribute('data-opt-idx')!, 10);
          if (q.options && q.options[oIdx]) {
            q.options[oIdx]!.text = (e.target as HTMLInputElement).value;
            onChange([...questions]);
          }
        });
      });

      card.querySelectorAll('.q-correct-opt').forEach((chk) => {
        chk.addEventListener('change', () => {
          if (q.type === 'multiple_select') {
            const selectedOpts = Array.from(card.querySelectorAll('.q-correct-opt:checked')).map((el) => (el as HTMLInputElement).value);
            q.correctOptionIds = selectedOpts;
          } else {
            q.correctOptionId = (chk as HTMLInputElement).value;
          }
          onChange([...questions]);
        });
      });

      card.querySelectorAll('.q-tf-opt').forEach((tf) => {
        tf.addEventListener('change', () => {
          q.correctBool = (tf as HTMLInputElement).value === 'true';
          onChange([...questions]);
        });
      });

      const numTargetInput = card.querySelector('.q-num-target') as HTMLInputElement;
      if (numTargetInput) {
        numTargetInput.addEventListener('input', () => {
          q.numericTarget = parseFloat(numTargetInput.value) || 0;
          onChange([...questions]);
        });
      }

      const refTextarea = card.querySelector('.q-ref-input') as HTMLTextAreaElement;
      if (refTextarea) {
        refTextarea.addEventListener('input', () => {
          q.referenceAnswer = refTextarea.value;
          onChange([...questions]);
        });
      }

      card.querySelector('.btn-dup-q')!.addEventListener('click', () => {
        const dup: ExamQuestion = {
          ...JSON.parse(JSON.stringify(q)),
          id: 'q-temp-' + Date.now().toString(36),
          prompt: q.prompt + ' (کپی)',
        };
        const newQs = [...questions];
        newQs.splice(idx + 1, 0, dup);
        onChange(newQs);
      });

      card.querySelector('.btn-del-q')!.addEventListener('click', () => {
        if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
          const newQs = questions.filter((_, i) => i !== idx);
          onChange(newQs);
        }
      });

      qList.appendChild(card);
    });
  }

  container.appendChild(header);
  container.appendChild(addBar);
  container.appendChild(qList);

  return container;
}

export function renderExamBuilderStep4(
  orgId: string,
  subjectId: string,
  onImportQuestions: (importedQuestions: ExamQuestion[]) => void
): HTMLElement {
  const container = createElement('div', { className: 'space-y-4 text-xs text-gray-800 dark:text-gray-200 dir-rtl' });

  const bankItems = schoolStore.getQuestionBank(orgId);

  let filterType = 'all';
  let filterDiff = 'all';
  let searchQuery = '';

  const selectedBankIds: string[] = [];

  const renderContent = () => {
    container.innerHTML = '';

    const filtered = bankItems.filter((q) => {
      const matchSub = !subjectId || q.subjectId === subjectId;
      const matchType = filterType === 'all' || q.type === filterType;
      const matchDiff = filterDiff === 'all' || q.difficulty === filterDiff;
      const matchSearch = !searchQuery || q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSub && matchType && matchDiff && matchSearch;
    });

    const card = createElement('div', { className: 'bg-gray-50/70 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4' });

    card.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 class="font-extrabold text-sm text-[#012622] dark:text-teal-400">گام ۴ — بهره‌گیری از بانک سوالات مرکز</h3>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">انتخاب و کپی سوالات استاندارد قبلی بدون تغییر بر روی نسخه اصلی بانک سوالات.</p>
        </div>

        <button type="button" id="btn-import-selected" class="px-4 py-2 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer ${
          selectedBankIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }">
          افزودن موارد انتخابی به آزمون (${selectedBankIds.length.toLocaleString('fa-IR')})
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
          <label class="block font-bold mb-1">جستجو در متن سوال:</label>
          <input type="text" id="qb-search" value="${searchQuery}" placeholder="عبارت کلیدی..." class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label class="block font-bold mb-1">نوع سوال:</label>
          <select id="qb-type" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs text-gray-900 dark:text-gray-100">
            <option value="all" ${filterType === 'all' ? 'selected' : ''}>همه انواع</option>
            <option value="single_choice" ${filterType === 'single_choice' ? 'selected' : ''}>تک‌گزینه‌ای</option>
            <option value="multiple_select" ${filterType === 'multiple_select' ? 'selected' : ''}>چندگزینه‌ای</option>
            <option value="true_false" ${filterType === 'true_false' ? 'selected' : ''}>صحیح/غلط</option>
            <option value="numeric" ${filterType === 'numeric' ? 'selected' : ''}>عددی</option>
            <option value="descriptive" ${filterType === 'descriptive' ? 'selected' : ''}>تشریحی</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">سطح سختی:</label>
          <select id="qb-diff" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-xs text-gray-900 dark:text-gray-100">
            <option value="all" ${filterDiff === 'all' ? 'selected' : ''}>همه سطح‌ها</option>
            <option value="easy" ${filterDiff === 'easy' ? 'selected' : ''}>ساده</option>
            <option value="medium" ${filterDiff === 'medium' ? 'selected' : ''}>متوسط</option>
            <option value="hard" ${filterDiff === 'hard' ? 'selected' : ''}>دشوار</option>
          </select>
        </div>
      </div>

      <!-- List -->
      <div class="space-y-2 max-h-64 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        ${filtered.length === 0 ? `
          <div class="p-6 text-center text-gray-500 dark:text-gray-400">سوالی مطابق با فیلترهای انتخابی در بانک پیدا نشد.</div>
        ` : filtered.map((qb) => {
          const isSelected = selectedBankIds.includes(qb.id);
          return `
            <label class="p-3 rounded-xl border ${isSelected ? 'border-[#012622] dark:border-teal-500 bg-[#ECE5F0]/50 dark:bg-teal-950/40' : 'border-gray-200 dark:border-gray-700'} flex items-start justify-between cursor-pointer hover:border-[#012622] transition-all">
              <div class="flex items-start gap-2.5">
                <input type="checkbox" value="${qb.id}" class="qb-chk text-[#012622] rounded mt-0.5" ${isSelected ? 'checked' : ''} />
                <div class="space-y-1">
                  <div class="font-bold text-gray-900 dark:text-gray-100">${qb.prompt}</div>
                  <div class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">${qb.subjectName} | بارم: ${qb.points} نمره | مدرس: ${qb.createdByTeacherName}</div>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] rounded font-bold">${qb.type}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;

    // Handlers
    const searchEl = card.querySelector('#qb-search') as HTMLInputElement;
    searchEl.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      renderContent();
    });

    const typeEl = card.querySelector('#qb-type') as HTMLSelectElement;
    typeEl.addEventListener('change', (e) => {
      filterType = (e.target as HTMLSelectElement).value;
      renderContent();
    });

    const diffEl = card.querySelector('#qb-diff') as HTMLSelectElement;
    diffEl.addEventListener('change', (e) => {
      filterDiff = (e.target as HTMLSelectElement).value;
      renderContent();
    });

    card.querySelectorAll('.qb-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const val = (chk as HTMLInputElement).value;
        const idx = selectedBankIds.indexOf(val);
        if (idx !== -1) selectedBankIds.splice(idx, 1);
        else selectedBankIds.push(val);
        renderContent();
      });
    });

    const importBtn = card.querySelector('#btn-import-selected') as HTMLButtonElement;
    importBtn.addEventListener('click', () => {
      if (selectedBankIds.length === 0) return;

      const importedQs: ExamQuestion[] = selectedBankIds.map((bankId) => {
        const b = bankItems.find((item) => item.id === bankId)!;
        return {
          id: 'q-temp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 4),
          examId: 'draft-exam',
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
          ...(b.explanation ? { explanation: b.explanation } : {}),
        };
      });

      onImportQuestions(importedQs);
      showToast({ title: 'سوالات افزوده شد', message: `${importedQs.length.toLocaleString('fa-IR')} سوال با موفقیت از بانک سوالات کپی شد.`, type: 'success' });
    });

    container.appendChild(card);
  };

  renderContent();
  return container;
}
