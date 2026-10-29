/**
 * POLARIS STUDENT HOMEWORK SUBMISSION PAGE
 * List assignments, submit text & file attachments, and view teacher scores & feedback.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { Assignment } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { formatGrade } from '../../../utils/formatters';

export function createStudentAssignmentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const user = authService.getCurrentUser();
  const students = schoolStore.getStudents(orgId);
  const currentStudent = students.find((s) => s.fullName === user?.name) || students[0];

  const assignments = schoolStore.getAssignments(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-border space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
        ${getDashboardIcon('assignment', 'w-6 h-6 text-primary')} تکالیف و پروژه تحصیلی من
      </h2>
      <p class="text-xs sm:text-sm text-muted-foreground">مشاهده تکالیف فعال، ارسال پاسخ متنی/فایلی و بررسی نمره و بازخورد استاد.</p>
    `;

    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (assignments.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-card p-8 text-center border border-border rounded-2xl text-xs text-muted-foreground">تکلیفی برای شما تعریف نشده است.</div>`;
    } else {
      assignments.forEach((asg) => {
        const studentSubmissions = currentStudent ? schoolStore.getSubmissionsForStudent(orgId, currentStudent.id) : [];
        const mySub = studentSubmissions.find((s) => s.assignmentId === asg.id);

        const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <span class="font-bold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg">${asg.className}</span>
              <span class="text-[11px] font-mono text-muted-foreground">مهلت تحویل: ${asg.dueDate}</span>
            </div>
            <h3 class="font-extrabold text-sm text-foreground">${asg.title}</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">${asg.description}</p>
            <div class="text-[11px] text-muted-foreground">استاد آموزگار: <strong>${asg.assignedByTeacherName}</strong></div>
          </div>

          <div class="pt-3 border-t border-border flex items-center justify-between">
            <span class="px-2.5 py-1 rounded text-[11px] font-bold ${
              mySub
                ? mySub.status === 'graded'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }">
              ${mySub ? (mySub.status === 'graded' ? `نمره: ${formatGrade(mySub.score)} از ۲۰` : 'ارسال شده (در انتظار بررسی)') : 'در انتظار ارسال پاسخ'}
            </span>

            <button class="action-btn px-4 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition-colors cursor-pointer">
              ${mySub ? 'مشاهده و جزئیات پاسخ' : 'ارسال پاسخ تکلیف'}
            </button>
          </div>
        `;

        const actionBtn = card.querySelector('.action-btn') as HTMLButtonElement;
        actionBtn.addEventListener('click', () => openSubmitModal(asg, mySub));

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openSubmitModal = (asg: Assignment, mySub?: any) => {
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-foreground' });

    if (mySub) {
      content.innerHTML = `
        <div class="bg-surface-subtle p-4 rounded-xl border border-border space-y-2">
          <div class="font-bold text-foreground border-b pb-2 border-border">پاسخ ثبت‌شده شما (تاریخ: ${mySub.submissionDate}):</div>
          <p class="text-muted-foreground leading-relaxed bg-card p-2.5 rounded-lg border border-border">${mySub.textContent}</p>
          ${mySub.fileName ? `<div class="text-indigo-600 dark:text-indigo-400 font-semibold">📎 فایل ارسالی: ${mySub.fileName} (${mySub.fileSize || '۱ مگابایت'})</div>` : ''}
        </div>

        ${
          mySub.status === 'graded'
            ? `<div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1.5 text-emerald-600 dark:text-emerald-400">
                <div class="font-bold text-sm">نمره کسب‌شده: ${formatGrade(mySub.score)} از ۲۰</div>
                <div><strong>بازخورد استاد:</strong> ${mySub.feedback || 'پاسخ کامل و صحیح است.'}</div>
              </div>`
            : `<div class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">پاسخ شما با موفقیت دریافت گردیده و در صف بررسی استاد قرار دارد.</div>`
        }
      `;

      const modal = new Modal({
        title: `جزئیات پاسخ تکلیف — ${asg.title}`,
        content,
        confirmText: 'بستن',
      });
      modal.open();
    } else {
      const form = createElement('form', { className: 'space-y-3.5 text-xs text-foreground dir-rtl' });
      form.innerHTML = `
        <div>
          <label class="block font-bold mb-1">شرح پاسخ تکلیف *</label>
          <textarea id="sub-text" rows="4" required class="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground" placeholder="متن توضیحات، پاسخ تمرینات و استدلال خود را بنویسید..."></textarea>
        </div>

        <div>
          <label class="block font-bold mb-1">ضمیمه فایل پاسخ (اختیاری):</label>
          <input type="file" id="sub-file" class="w-full bg-surface border border-border rounded-xl p-2 text-xs text-foreground" />
          <p class="text-[10px] text-muted-foreground mt-1">توضیح: فایل انتخابی جهت شبیه‌سازی تحویل پروژه نگهداری می‌شود.</p>
        </div>
      `;

      const modal = new Modal({
        title: `ارسال پاسخ تکلیف — ${asg.title}`,
        content: form,
        confirmText: 'ارسال نهایی پاسخ',
        cancelText: 'انصراف',
        onConfirm: () => {
          const textContent = (form.querySelector('#sub-text') as HTMLTextAreaElement).value.trim();
          const fileInput = form.querySelector('#sub-file') as HTMLInputElement;

          if (!textContent) {
            showToast({ title: 'خطا', message: 'لطفاً متن توضیحات پاسخ را وارد نمایید.', type: 'warning' });
            return;
          }

          const file = fileInput.files?.[0];
          const fileName = file ? file.name : undefined;
          const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} مگابایت` : undefined;

          if (currentStudent) {
            const subPayload: any = {
              assignmentId: asg.id,
              organizationId: orgId,
              studentId: currentStudent.id,
              studentName: currentStudent.fullName,
              textContent,
            };
            if (fileName) {
              subPayload.fileName = fileName;
              subPayload.fileSize = fileSize;
            }

            schoolStore.submitHomework(subPayload);
            showToast({ title: 'تحویل داده شد', message: 'پاسخ تکلیف شما با موفقیت برای معلم ارسال شد.', type: 'success' });
            render();
          }
        },
      });

      modal.open();
    }
  };

  render();
  return rootWrapper;
}
