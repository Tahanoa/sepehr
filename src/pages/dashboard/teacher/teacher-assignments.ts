import { descriptive } from '../../../services/academic-store';
import { deleteAction } from '../../../components/dashboard/delete-action';
/**
 * POLARIS TEACHER ASSIGNMENTS & HOMEWORK INBOX PAGE
 * Homework creation, due dates, submission review inbox, feedback, and scoring.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { Assignment } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createTeacherAssignmentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }



  const render = () => {
    const assignments=schoolStore.getAssignments(orgId).filter(a=>classes.some(c=>c.id===a.classId));
    rootWrapper.innerHTML = '';

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('assignment', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} مدیریت تکالیف و صندوق دریافت پاسخ‌ها
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">تعریف تکلیف جدید، تنظیم مهلت تحویل، بررسی پاسخ‌های ارسالی دانش‌آموزان و درج نمره.</p>
    `;

    const addBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> تعریف تکلیف جدید`,
    });
    addBtn.addEventListener('click', () => openAddAssignmentModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Assignments Cards Grid
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (assignments.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">هنوز تکلیفی ثبت نشده است.</div>`;
    } else {
      assignments.forEach((asg) => {
        const submissions = schoolStore.getSubmissionsForAssignment(asg.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[rgb(var(--theme-primary))] bg-[rgb(var(--theme-subtle))] px-2.5 py-1 rounded-lg">${asg.className}</span>
              <span class="text-[11px] text-gray-500 font-mono">مهلت: ${asg.dueDate}</span>
            </div>
            <h3 class="font-semibold text-sm text-gray-900">${asg.title}</h3>
            <p class="text-xs text-gray-600 leading-relaxed line-clamp-2">${asg.description}</p>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span class="text-gray-500">تعداد پاسخ‌های دریافتی: <strong class="text-gray-900 font-mono">${submissions.length} مورد</strong></span>
            <button class="view-sub-btn px-3 py-1.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              صندوق پاسخ‌ها (${submissions.length})
            </button>
          </div>
        `;

        const viewSubBtn = card.querySelector('.view-sub-btn') as HTMLButtonElement;
        if (viewSubBtn) {
          viewSubBtn.addEventListener('click', () => openSubmissionsModal(asg));
        }

        card.append(deleteAction('تکلیف',()=>schoolStore.deleteAssignment(asg.id),render));
        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openAddAssignmentModal = () => {
    if (classes.length === 0) {
      showToast({ title: 'خطا', message: 'کلاسی برای تخصیص تکلیف یافت نشد.', type: 'warning' });
      return;
    }

    const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dir-rtl' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">عنوان تکلیف *</label>
        <input type="text" id="asg-title" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="مثال: حل تمرینات مشتق فصل سوم" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس انتسابی *</label>
          <select id="asg-classId" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs">
            ${classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">مهلت تحویل *</label>
          <input type="text" id="asg-dueDate" required value="۱۴۰۲/۱۲/۲۸" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">دستورالعمل و توضیحات تکلیف *</label>
        <textarea id="asg-desc" rows="3" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="توضیحات و فایل‌های پیوست مورد نیاز..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'تعریف تکلیف جدید',
      content: form,
      confirmText: 'انتشار تکلیف',
      cancelText: 'انصراف',
      onConfirm: () => {
        const title = (form.querySelector('#asg-title') as HTMLInputElement).value.trim();
        const classId = (form.querySelector('#asg-classId') as HTMLSelectElement).value;
        const dueDate = (form.querySelector('#asg-dueDate') as HTMLInputElement).value.trim();
        const description = (form.querySelector('#asg-desc') as HTMLTextAreaElement).value.trim();

        const selectedClass = classes.find((c) => c.id === classId) || classes[0]!;

        schoolStore.addAssignment({
          organizationId: orgId,
          classId: selectedClass.id,
          className: selectedClass.name,
          title,
          description,
          dueDate,
          assignedByTeacherId: membership.userId,
          assignedByTeacherName: authService.getCurrentUser()?.name || 'استاد آموزگار',
          maxScore: 20,
        });

        showToast({ title: 'تکلیف ثبت شد', message: 'تکلیف جدید برای دانش‌آموزان کلاس منتشر شد.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openSubmissionsModal = (asg: Assignment) => {
    const submissions = schoolStore.getSubmissionsForAssignment(asg.id);
    const isDesc=descriptive(membership,asg.classId);

    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });

    if (submissions.length === 0) {
      content.innerHTML = `<div class="p-6 text-center text-gray-500 border border-gray-200 rounded-xl">هنوز پاسخی برای این تکلیف ارسال نشده است.</div>`;
    } else {
      const list = createElement('div', { className: 'space-y-3' });
      submissions.forEach((sub) => {
        const item = createElement('div', { className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2' });
        item.innerHTML = `
          <div class="flex items-center justify-between pb-2 border-b border-gray-200">
            <span class="font-bold text-gray-900">${sub.studentName}</span>
            <span class="text-[11px] font-mono text-gray-500">${sub.submissionDate}</span>
          </div>
          <p class="text-gray-800 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">${sub.textContent}</p>
          ${sub.fileName ? `<div class="text-[11px] text-indigo-700 font-semibold">📎 فایل پیوست: ${sub.fileName} (${sub.fileSize || '۱ مگابایت'})</div>` : ''}

          <div class="pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-[11px] mb-0.5">${isDesc?"ارزشیابی توصیفی:":"نمره (از ۲۰):"}</label>
              ${isDesc?`<select id="sub-score-${sub.id}" aria-label="ارزشیابی"><option value="">انتخاب سطح</option>${['خیلی خوب','خوب','قابل قبول','نیاز به تلاش بیشتر'].map(v=>`<option ${sub.descriptiveScore===v?'selected':''}>${v}</option>`).join('')}</select>`:`<input type="number" id="sub-score-${sub.id}" value="${sub.score ?? ''}" max="20" min="0" class="w-full bg-white border border-gray-300 rounded p-1.5" />`}

            </div>
            <div>
              <label class="block font-bold text-[11px] mb-0.5">بازخورد معلم:</label>
              <input type="text" id="sub-feedback-${sub.id}" value="${sub.feedback || 'پاسخ کاملاً درست است.'}" class="w-full bg-white border border-gray-300 rounded p-1.5 text-xs" />
            </div>
          </div>
        `;

        const saveBtn = createElement('button', {
          className: 'mt-2 px-3 py-1.5 bg-[rgb(var(--theme-primary))] text-white text-xs font-bold rounded-lg hover:bg-[rgb(var(--theme-hover))]',
          textContent: 'ذخیره نمره و بازخورد',
        });

        saveBtn.addEventListener('click', () => {
          const scoreInput = item.querySelector(`#sub-score-${sub.id}`) as HTMLInputElement;
          const feedbackInput = item.querySelector(`#sub-feedback-${sub.id}`) as HTMLInputElement;

          const scoreVal = isDesc ? scoreInput.value : parseFloat(scoreInput.value);
          if(!scoreInput.value || (typeof scoreVal==='number'&&(!Number.isFinite(scoreVal)||scoreVal<0||scoreVal>20))){showToast({title:'ارزشیابی',message:'ارزشیابی معتبر وارد کنید.',type:'warning'});return;}
          const feedbackVal = feedbackInput ? feedbackInput.value : 'تایید شد';

          schoolStore.gradeHomeworkSubmission(sub.id, scoreVal, feedbackVal);
          showToast({ title: 'نمره ثبت شد', message: `نمره دانش‌آموز «${sub.studentName}» بروزرسانی گردید.`, type: 'success' });
        });

        item.appendChild(saveBtn);
        list.appendChild(item);
      });

      content.appendChild(list);
    }

    const modal = new Modal({
      title: `پاسخ‌های ارسالی تکلیف — ${asg.title}`,
      content,
      confirmText: 'بستن',
    });
    modal.open();
  };

  render();
  return rootWrapper;
}
