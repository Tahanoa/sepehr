/**
 * POLARIS STUDENT HOMEWORK SUBMISSION PAGE
 * List assignments, submit text & file attachments, and view teacher scores & feedback.
 */

import { OrganizationMembership } from '../../../types/auth';
import { selectedLearner } from '../shared/family-data';
import { Assignment } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createStudentAssignmentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const currentStudent=selectedLearner(membership);

  const assignments = schoolStore.getAssignments(orgId).filter(a=>a.classId===currentStudent?.classId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('assignment', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} تکالیف و پروژه تحصیلی من
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">مشاهده تکالیف فعال، ارسال پاسخ متنی/فایلی و بررسی نمره و بازخورد استاد.</p>
    `;

    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

    if (assignments.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">تکلیفی برای شما تعریف نشده است.</div>`;
    } else {
      assignments.forEach((asg) => {
        const studentSubmissions = currentStudent ? schoolStore.getSubmissionsForStudent(orgId, currentStudent.id) : [];
        const mySub = studentSubmissions.find((s) => s.assignmentId === asg.id);

        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
              <span class="font-bold text-xs text-[rgb(var(--theme-primary))] bg-[rgb(var(--theme-subtle))] px-2.5 py-1 rounded-lg">${asg.className}</span>
              <span class="text-[11px] font-mono text-gray-500">مهلت تحویل: ${asg.dueDate}</span>
            </div>
            <h3 class="font-semibold text-sm text-gray-900">${asg.title}</h3>
            <p class="text-xs text-gray-600 leading-relaxed">${asg.description}</p>
            <div class="text-[11px] text-gray-500">استاد آموزگار: <strong>${asg.assignedByTeacherName}</strong></div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="px-2.5 py-1 rounded text-[11px] font-bold ${
              mySub
                ? mySub.status === 'graded'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-900'
            }">
              ${mySub ? (mySub.status === 'graded' ? `نمره: ${mySub.descriptiveScore||`${mySub.score} از ۲۰`}` : 'ارسال شده (در انتظار بررسی)') : 'در انتظار ارسال پاسخ'}
            </span>

            <button class="action-btn px-4 py-1.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
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
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });

    if (mySub) {
      content.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <div class="font-bold text-gray-900 border-b pb-2 border-gray-200">پاسخ ثبت‌شده شما (تاریخ: ${mySub.submissionDate}):</div>
          <p class="text-gray-700 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">${mySub.textContent}</p>
          ${mySub.fileName ? `<div class="text-indigo-700 font-semibold">📎 فایل ارسالی: ${mySub.fileName} (${mySub.fileSize || '۱ مگابایت'})</div>` : ''}
        </div>

        ${
          mySub.status === 'graded'
            ? `<div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5 text-emerald-900">
                <div class="font-bold text-sm">نمره کسب‌شده: ${mySub.descriptiveScore||`${mySub.score} از ۲۰`}</div>
                <div><strong>بازخورد استاد:</strong> ${mySub.feedback || 'پاسخ کامل و صحیح است.'}</div>
              </div>`
            : `<div class="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">پاسخ شما با موفقیت دریافت گردیده و در صف بررسی استاد قرار دارد.</div>`
        }
      `;

      const modal = new Modal({
        title: `جزئیات پاسخ تکلیف — ${asg.title}`,
        content,
        confirmText: 'بستن',
      });
      modal.open();
    } else {
      const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dir-rtl' });
      form.innerHTML = `
        <div>
          <label class="block font-bold mb-1">شرح پاسخ تکلیف *</label>
          <textarea id="sub-text" rows="4" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs" placeholder="متن توضیحات، پاسخ تمرینات و استدلال خود را بنویسید..."></textarea>
        </div>

        <div>
          <label class="block font-bold mb-1">ضمیمه فایل پاسخ (اختیاری):</label>
          <input type="file" id="sub-file" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
          <p class="text-[10px] text-gray-500 mt-1">توضیح: فایل انتخابی جهت شبیه‌سازی تحویل پروژه نگهداری می‌شود.</p>
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
