import { deleteAction } from '../../../components/dashboard/delete-action';
import { classesFor } from '../../../services/academic-store';
import { el, button, input, field, status, select } from '../../../components/workspace';
/**
 * POLARIS TEACHER EXAM BUILDER, MANAGEMENT & INTEGRITY LOG PAGE
 * Complete multi-step builder, tabbed exam dashboard, descriptive grading queue,
 * and integrity activity log review panel.
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

    const allowedClasses=new Set(classesFor(membership).map(c=>c.id));
    const allExams = schoolStore.getExams(orgId).filter(e=>e.classIds.some(id=>allowedClasses.has(id)));
    const activityLogs = schoolStore.getExamActivityLogs(orgId);

    // Filter exams by tab
    let displayExams = allExams;
    if (activeTab !== 'all' && activeTab !== 'activity_logs') {
      displayExams = allExams.filter((e) => e.status === activeTab);
    }

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('exam', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} طراح هوشمند و مدیریت آزمون‌ها
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">تعریف آزمون‌های چندمرحله‌ای، بانک سوالات، تصحیح پاسخ‌های تشریحی و بررسی گزارش سلامت جلسه.</p>
    `;

    const addBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ساخت آزمون جدید`,
    });
    addBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/exam-builder` }));
    });

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Tabs
    const tabsNav = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto text-xs font-semibold' });

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
          activeTab === t.key ? 'bg-[rgb(var(--theme-primary))] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">امتحانی در این وضعیت یافت نشد.</div>`;
    } else {
      displayExams.forEach((ex) => {
        const questions = schoolStore.getExamQuestions(ex.id);
        const attempts = schoolStore.getExamAttemptsForExam(ex.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between' });

        let statusText = 'برنامه‌ریزی شده';
        let statusBg = 'bg-blue-100 text-blue-900';

        if (ex.status === 'draft') { statusText = 'پیش‌نویس'; statusBg = 'bg-gray-100 text-gray-800'; }
        else if (ex.status === 'available' || ex.status === 'in_progress') { statusText = 'در حال برگزاری'; statusBg = 'bg-emerald-100 text-emerald-900'; }
        else if (ex.status === 'grading' || ex.status === 'submitted') { statusText = 'در انتظار تصحیح'; statusBg = 'bg-amber-100 text-amber-900'; }
        else if (ex.status === 'published' || ex.status === 'completed') { statusText = 'منتشر شده'; statusBg = 'bg-[rgb(var(--theme-primary))] text-white'; }
        else if (ex.status === 'archived') { statusText = 'آرشیو شده'; statusBg = 'bg-rose-100 text-rose-900'; }

        card.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[rgb(var(--theme-primary))] bg-[rgb(var(--theme-subtle))] px-2.5 py-1 rounded-lg">${ex.subjectName}</span>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusBg}">${statusText}</span>
            </div>
            <h3 class="font-semibold text-sm text-gray-900">${ex.title}</h3>
            <div class="text-xs text-gray-600 space-y-1">
              <div><strong>تاریخ برگزاری:</strong> <span class="font-mono">${ex.examDate} (${ex.durationMinutes} دقیقه)</span></div>
              <div><strong>تعداد سوالات / سقف نمره:</strong> <span class="font-mono font-bold">${questions.length} سوال (${ex.maxScore} نمره)</span></div>
              <div><strong>تعداد تلاش‌های ثبت شده:</strong> <span class="font-mono font-bold">${attempts.length.toLocaleString('fa-IR')} شرکت‌کننده</span></div>
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs flex-wrap">
            <button class="edit-btn px-3 py-1.5 bg-[rgb(var(--theme-subtle))] hover:bg-[rgb(var(--theme-subtle))]/80 text-[rgb(var(--theme-primary))] font-bold rounded-xl transition-colors cursor-pointer">
              ✏️ ویرایش
            </button>
            <button class="grade-btn px-3 py-1.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold rounded-xl transition-colors cursor-pointer">
              تصحیح و نمره‌دهی
            </button>
            <button class="dup-btn px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer">
              رونوشت (کپی)
            </button>
            <button class="pub-btn px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl transition-colors cursor-pointer">
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
          if(ex.aiSourceName&&!ex.aiReviewed){window.dispatchEvent(new CustomEvent('polaris-navigate',{detail:`/app/${orgId}/exam-builder?examId=${ex.id}`}));return;}
          const newStatus: ExamStatus = ex.status === 'published' ? 'scheduled' : 'published';
          schoolStore.updateExam(ex.id, { status: newStatus });
          showToast({ title: 'وضعیت بروز شد', message: 'وضعیت انتشار آزمون با موفقیت تغییر کرد.', type: 'info' });
          render();
        });

        card.append(deleteAction('آزمون',()=>schoolStore.deleteExam(ex.id),render));
        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(grid);
  };


  const renderActivityLogsPanel = (logs: any[]) => {
    const container = createElement('div', { className: 'bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4 text-xs dir-rtl' });

    container.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="font-bold text-sm text-[rgb(var(--theme-primary))]">گزارشات فعالیت و سیگنال‌های سلامت جلسه آزمون</h3>
          <p class="text-gray-500 text-[11px]">رویدادهای ثبت‌شده توسط سیستم صرفاً جهت بررسی مدرس است و تخلف قطعی تلقی نمی‌گردد.</p>
        </div>
        <span class="px-3 py-1 bg-amber-100 text-amber-950 font-bold font-mono rounded-xl">
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
              <tr><td colspan="7" class="text-center py-6 text-gray-500">هیچ رویداد مشکوک یا قطعی در جلسات آزمون ثبت نشده است.</td></tr>
            ` : logs.map((log) => `
              <tr>
                <td class="font-bold text-gray-900">${log.studentName}</td>
                <td>${log.examTitle}</td>
                <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">${log.eventType}</span></td>
                <td class="font-mono text-[11px]">${log.timestamp}</td>
                <td class="text-gray-600">${log.description}</td>
                <td>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.reviewStatus === 'confirmed_violation' ? 'bg-rose-100 text-rose-900' :
                    log.reviewStatus === 'reviewed_ok' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }">
                    ${log.reviewStatus === 'confirmed_violation' ? 'تایید تخلف (انضباطی)' : log.reviewStatus === 'reviewed_ok' ? 'تایید — بدون مشکل' : 'نیازمند بررسی مدرس'}
                  </span>
                </td>
                <td class="text-center">
                  <button type="button" data-log-id="${log.id}" class="btn-review-log px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer">
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
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">نتیجه بررسی مدرس *</label>
        <select id="log-status" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold">
          <option value="reviewed_ok">تایید بررسی — موجه و بدون مشکل آموزشی</option>
          <option value="needs_review">نیازمند بررسی بیشتر / جلسه حضوری با ولی</option>
          <option value="confirmed_violation">تخلف قطعی بعد از بررسی انسانی (ثبت نمره صفر)</option>
        </select>
      </div>

      <div>
        <label class="block font-bold mb-1">توضیحات و دلیل تصمیم مدرس</label>
        <textarea id="log-note" rows="3" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="دلیل تصمیم انسانی جهت درج در سوابق آزمون..."></textarea>
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
    const container = createElement('div', { className: 'space-y-4 dir-rtl text-xs text-gray-800 max-h-[60vh] overflow-y-auto p-1' });

    container.append(el('div',{className:'ai-studio',textContent:'✦ دستیار تصحیح AI · نسخه نمایشی — بررسی پاسخ‌برگ ← پیشنهاد نمره ← بازبینی دبیر ← ثبت نهایی. هیچ پاسخ یا فایلی به سرویس هوش مصنوعی ارسال نمی‌شود.'}));
    if (attempts.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">هنوز پاسخی برای این آزمون ثبت نشده است.</div>`;
    } else {
      attempts.forEach((att) => {
        const item = createElement('div', { className: 'p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2' });
        item.innerHTML = `
          <div class="flex items-center justify-between font-bold text-gray-900 border-b border-gray-200 pb-2">
            <span>${att.studentName} (${att.className || 'کلاس اصلی'})</span>
            <span class="font-mono text-gray-500">زمان تحویل: ${att.submittedAt || '—'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-gray-700">
            <div>نمره سوالات عینی (تستی): <strong class="font-mono">${att.mcqScore ?? 0} نمره</strong></div>
            <div>نمره نهایی ثبت شده: <strong class="font-mono">${att.totalScore ?? 'نامشخص'} از ${ex.maxScore}</strong></div>
          </div>
        `;
        if(membership.organization.type==='elementary_school'){
          item.querySelector('.grid')?.remove();
          const value=select(['','خیلی خوب','خوب','قابل قبول','نیاز به تلاش بیشتر'].map(v=>({id:v,name:v||'انتخاب سطح'})),String(att.descriptiveScore||''),()=>{}),message=status();
          item.append(field('ارزشیابی توصیفی پاسخ‌برگ',value),button('✦ پیشنهاد AI (نمایشی)',()=>{value.value='خوب';message.textContent='نمونه ثابت نمایشی است؛ پاسخ‌ها را مرور و سطح نهایی را تعیین کنید.';}),button('ثبت ارزشیابی بازبینی‌شده',()=>{if(!value.value){message.textContent='سطح ارزشیابی را انتخاب کنید.';return;}const saved={...att,descriptiveScore:value.value,status:'graded'};delete saved.totalScore;delete saved.mcqScore;schoolStore.saveExamAttempt(saved);message.textContent='ارزشیابی ثبت شد.';},true),message);
        }else if(att.status !== 'in_progress') {
          const fields=new Map<string,HTMLInputElement>();
          const questions=schoolStore.getExamQuestions(ex.id), scores:Record<string,number>={...(att.questionScores||{})}, notice=status();
          for(const q of questions){
            const answer=att.answers?.[q.id] ?? att.descriptiveAnswers?.[q.id] ?? att.mcqAnswers?.[q.id] ?? '';
            const section=el('section',{className:'grading-question'}), score=input(String(scores[q.id]??''),'number');fields.set(q.id,score);score.min='0';score.max=String(q.points);score.step='.25';
            section.append(el('h4',{textContent:q.prompt}),el('p',{textContent:'پاسخ دانش‌آموز: '+String(answer),className:'workspace-notice'}),field('نمره از '+q.points,score));
            score.addEventListener('input',()=>{scores[q.id]=Number(score.value);});
            const details=el('details');details.append(el('summary',{textContent:'پاسخ و نمرهٔ سؤال '+(questions.indexOf(q)+1)}),section);item.append(details);
          }
          item.prepend(button('✦ تصحیح با AI · کل پاسخ‌برگ (نمایشی)',()=>{
            for(const q of questions){const answer=att.answers?.[q.id] ?? att.descriptiveAnswers?.[q.id] ?? att.mcqAnswers?.[q.id] ?? '';const words=(q.referenceAnswer||'').split(/\s+/).filter(Boolean);const score=words.length?Math.round(q.points*words.filter(w=>String(answer).includes(w)).length/words.length*4)/4:undefined;if(score===undefined)continue;scores[q.id]=score;fields.get(q.id)!.value=String(score);}
            notice.textContent='پیشنهادهای کل پاسخ‌برگ آماده شد؛ صرفاً شبیه‌سازی تطابق واژه‌ها، نه مدل AI واقعی. سؤال فاقد پاسخ مرجع نیازمند نمرهٔ دستی است. پس از بازبینی ثبت کنید.';
          },true));
          item.append(notice,button('ثبت نمرات بازبینی‌شده',()=>{
            if(questions.some(q=>!Number.isFinite(scores[q.id])||scores[q.id]!<0||scores[q.id]!>q.points)){notice.textContent='برای همهٔ سؤال‌ها نمرهٔ معتبر وارد کنید.';return;}
            schoolStore.saveExamAttempt({...att,questionScores:scores,totalScore:Object.values(scores).reduce((a,b)=>a+b,0),status:'graded'});notice.textContent='نمرات با تأیید دبیر ثبت شد.';
          },true));
        }
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

