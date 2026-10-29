/**
 * POLARIS TEACHER EXAM BUILDER, MANAGEMENT & INTEGRITY LOG PAGE
 * Complete multi-step builder, tabbed exam dashboard, descriptive grading queue,
 * and integrity activity log review panel with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Exam, ExamStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createTeacherExamsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  let activeTab: ExamStatus | 'all' | 'activity_logs' = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const allExams = schoolStore.getExams(orgId);
    const activityLogs = schoolStore.getExamActivityLogs(orgId);

    // Filter exams by tab
    let displayExams = allExams;
    if (activeTab !== 'all' && activeTab !== 'activity_logs') {
      displayExams = allExams.filter((e) => e.status === activeTab);
    }

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
        ${getDashboardIcon('exam', 'w-6 h-6 text-[#012622] dark:text-teal-400')} طراح هوشمند و مدیریت آزمون‌ها
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">تعریف آزمون‌های چندمرحله‌ای، بانک سوالات، تصحیح پاسخ‌های تشریحی و بررسی گزارش سلامت جلسه.</p>
    `;

    const addBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ساخت آزمون جدید`,
    });
    addBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exam-builder` }));
    });

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Tabs
    const tabsNav = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto text-xs font-extrabold' });

    const tabList: { key: typeof activeTab; label: string; count?: number }[] = [
      { key: 'all', label: 'همه آزمون‌ها', count: allExams.length },
      { key: 'draft', label: 'پیش‌نویس‌ها', count: allExams.filter((e) => e.status === 'draft').length },
      { key: 'scheduled', label: 'برنامه‌ریزی شده', count: allExams.filter((e) => e.status === 'scheduled').length },
      { key: 'available', label: 'در حال برگزاری / فعال', count: allExams.filter((e) => e.status === 'available' || e.status === 'in_progress').length },
      { key: 'grading', label: 'نیازمند تصحیح تشریحی', count: allExams.filter((e) => e.status === 'grading' || e.status === 'submitted').length },
      { key: 'published', label: 'منتشر شده', count: allExams.filter((e) => e.status === 'published' || e.status === 'completed').length },
      { key: 'archived', label: 'آرشیو شده', count: allExams.filter((e) => e.status === 'archived').length },
      { key: 'activity_logs', label: 'گزارش فعالیت و سلامت جلسه', count: activityLogs.length },
    ];

    tabList.forEach((t) => {
      const btn = createElement('button', {
        className: `px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
          activeTab === t.key ? 'bg-[#012622] dark:bg-teal-700 text-white shadow-2xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`,
        textContent: `${t.label} (${(t.count || 0).toLocaleString('fa-IR')})`,
      });
      btn.addEventListener('click', () => {
        activeTab = t.key;
        render();
      });
      tabsNav.appendChild(btn);
    });

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tabsNav);

    // Content Panel based on Tab
    if (activeTab === 'activity_logs') {
      rootWrapper.appendChild(renderActivityLogsPanel(activityLogs));
      return;
    }

    // Grid Cards for Exams
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (displayExams.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white dark:bg-gray-800 p-8 text-center border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-500 dark:text-gray-400">امتحانی در این وضعیت یافت نشد.</div>`;
    } else {
      displayExams.forEach((ex) => {
        const questions = schoolStore.getExamQuestions(ex.id);
        const attempts = schoolStore.getExamAttemptsForExam(ex.id);

        const card = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-4 flex flex-col justify-between' });

        let statusText = 'برنامه‌ریزی شده';
        let statusBg = 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300';

        if (ex.status === 'draft') { statusText = 'پیش‌نویس'; statusBg = 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'; }
        else if (ex.status === 'available' || ex.status === 'in_progress') { statusText = 'در حال برگزاری'; statusBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'; }
        else if (ex.status === 'grading' || ex.status === 'submitted') { statusText = 'در انتظار تصحیح'; statusBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'; }
        else if (ex.status === 'published' || ex.status === 'completed') { statusText = 'منتشر شده'; statusBg = 'bg-[#012622] dark:bg-teal-700 text-white'; }
        else if (ex.status === 'archived') { statusText = 'آرشیو شده'; statusBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300'; }

        card.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <span class="font-bold text-xs text-[#012622] dark:text-teal-300 bg-[#ECE5F0] dark:bg-gray-700 px-2.5 py-1 rounded-lg">${ex.subjectName}</span>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusBg}">${statusText}</span>
            </div>
            <h3 class="font-extrabold text-sm text-gray-900 dark:text-gray-100">${ex.title}</h3>
            <div class="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div><strong>تاریخ برگزاری:</strong> <span class="font-mono">${ex.examDate} (${ex.durationMinutes} دقیقه)</span></div>
              <div><strong>تعداد سوالات / سقف نمره:</strong> <span class="font-mono font-bold">${questions.length} سوال (${ex.maxScore} نمره)</span></div>
              <div><strong>تعداد تلاش‌های ثبت شده:</strong> <span class="font-mono font-bold">${attempts.length.toLocaleString('fa-IR')} شرکت‌کننده</span></div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 text-xs flex-wrap">
            <button class="edit-btn px-3 py-1.5 bg-[#ECE5F0] dark:bg-gray-700 hover:bg-[#ECE5F0]/80 text-[#012622] dark:text-teal-300 font-bold rounded-xl transition-colors cursor-pointer">
              ✏️ ویرایش
            </button>
            <button class="grade-btn px-3 py-1.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white font-bold rounded-xl transition-colors cursor-pointer">
              تصحیح و نمره‌دهی
            </button>
            <button class="dup-btn px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors cursor-pointer">
              رونوشت (کپی)
            </button>
            <button class="pub-btn px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 font-bold rounded-xl transition-colors cursor-pointer">
              ${ex.status === 'published' ? 'خروج از انتشار' : 'انتشار آزمون'}
            </button>
          </div>
        `;

        card.querySelector('.edit-btn')!.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exam-builder?examId=${ex.id}` }));
        });
        card.querySelector('.grade-btn')!.addEventListener('click', () => openDescriptiveGradingQueueModal(ex, attempts));
        card.querySelector('.dup-btn')!.addEventListener('click', () => {
          schoolStore.duplicateExam(ex.id);
          showToast({ title: 'رونوشت ایجاد شد', message: `رونوشت جدیدی از آزمون «${ex.title}» ساخته شد.`, type: 'success' });
          render();
        });
        card.querySelector('.pub-btn')!.addEventListener('click', () => {
          const newStatus: ExamStatus = ex.status === 'published' ? 'scheduled' : 'published';
          schoolStore.updateExam(ex.id, { status: newStatus });
          showToast({ title: 'وضعیت بروز شد', message: 'وضعیت انتشار آزمون با موفقیت تغییر کرد.', type: 'info' });
          render();
        });

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(grid);
  };


  const renderActivityLogsPanel = (logs: any[]) => {
    const container = createElement('div', { className: 'bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs space-y-4 text-xs dir-rtl' });

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 class="font-black text-sm text-[#012622] dark:text-teal-400">گزارشات فعالیت و سیگنال‌های سلامت جلسه آزمون</h3>
          <p class="text-gray-500 dark:text-gray-400 text-[11px]">رویدادهای ثبت‌شده توسط سیستم صرفاً جهت بررسی مدرس است و تخلف قطعی تلقی نمی‌گردد.</p>
        </div>
        <span class="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold font-mono rounded-xl">
          ${logs.filter((l) => l.reviewStatus === 'pending').length.toLocaleString('fa-IR')} رویداد نیازمند بررسی
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="polaris-table w-full">
          <thead>
            <tr>
              <th>دانش‌آموز</th>
              <th>آزمون</th>
              <th>نوع رویداد</th>
              <th>زمان</th>
              <th>توضیحات رویداد</th>
              <th>وضعیت بررسی</th>
              <th class="text-center">اقدام</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? `
              <tr><td colspan="7" class="text-center py-6 text-gray-500 dark:text-gray-400">هیچ رویداد مشکوک یا قطعی در جلسات آزمون ثبت نشده است.</td></tr>
            ` : logs.map((log) => `
              <tr>
                <td class="font-bold text-gray-900 dark:text-gray-100">${log.studentName}</td>
                <td class="dark:text-gray-200">${log.examTitle}</td>
                <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">${log.eventType}</span></td>
                <td class="font-mono text-[11px] dark:text-gray-300">${log.timestamp}</td>
                <td class="text-gray-600 dark:text-gray-300">${log.description}</td>
                <td>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.reviewStatus === 'confirmed_violation' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300' :
                    log.reviewStatus === 'reviewed_ok' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                  }">
                    ${log.reviewStatus === 'confirmed_violation' ? 'تایید تخلف (انضباطی)' : log.reviewStatus === 'reviewed_ok' ? 'تایید — بدون مشکل' : 'نیازمند بررسی مدرس'}
                  </span>
                </td>
                <td class="text-center">
                  <button type="button" data-log-id="${log.id}" class="btn-review-log px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-bold cursor-pointer">
                    ثبت تصمیم
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.btn-review-log').forEach((btn) => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-log-id')!;
        openReviewLogDecisionModal(logId);
      });
    });

    return container;
  };

  const openReviewLogDecisionModal = (logId: string) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800 dark:text-gray-200' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">نتیجه بررسی مدرس *</label>
        <select id="log-status" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
          <option value="reviewed_ok">تایید بررسی — موجه و بدون مشکل آموزشی</option>
          <option value="needs_review">نیازمند بررسی بیشتر / جلسه حضوری با ولی</option>
          <option value="confirmed_violation">تخلف قطعی بعد از بررسی انسانی (ثبت نمره صفر)</option>
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">توضیحات و دلیل تصمیم مدرس</label>
        <textarea id="log-note" rows="3" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100" placeholder="دلیل تصمیم انسانی جهت درج در سوابق آزمون..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'ثبت نتیجه بررسی رویداد جلسه آزمون',
      content: form,
      confirmText: 'ثبت تصمیم نهایی',
      cancelText: 'انصراف',
      onConfirm: () => {
        const status = (form.querySelector('#log-status') as HTMLSelectElement).value as any;
        const note = (form.querySelector('#log-note') as HTMLTextAreaElement).value.trim();

        schoolStore.updateExamActivityLogStatus(logId, status, currentUser?.name || 'مدرس', note);
        showToast({ title: 'ثبت شد', message: 'نتیجه بررسی رویداد با موفقیت ذخیره گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openDescriptiveGradingQueueModal = (ex: Exam, attempts: any[]) => {
    const container = createElement('div', { className: 'space-y-4 dir-rtl text-xs text-gray-800 dark:text-gray-200 max-h-[60vh] overflow-y-auto p-1' });

    if (attempts.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 rounded-xl">هنوز پاسخی برای این آزمون ثبت نشده است.</div>`;
    } else {
      attempts.forEach((att) => {
        const item = createElement('div', { className: 'p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2' });
        item.innerHTML = `
          <div class="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span>${att.studentName} (${att.className || 'کلاس اصلی'})</span>
            <span class="font-mono text-gray-500 dark:text-gray-400">زمان تحویل: ${att.submittedAt || '—'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
            <div>نمره سوالات عینی (تستی): <strong class="font-mono">${att.mcqScore ?? 0} نمره</strong></div>
            <div>نمره نهایی ثبت شده: <strong class="font-mono">${att.totalScore ?? 'نامشخص'} از ${ex.maxScore}</strong></div>
          </div>
        `;
        container.appendChild(item);
      });
    }

    const modal = new Modal({
      title: `صف تصحیح و نمره‌دهی — ${ex.title}`,
      content: container,
      confirmText: 'بستن',
    });
    modal.open();
  };

  render();
  return rootWrapper;
}
