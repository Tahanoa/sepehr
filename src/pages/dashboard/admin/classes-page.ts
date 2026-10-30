import { deleteAction } from '../../../components/dashboard/delete-action';
/**
 * POLARIS CLASS & GRADE MANAGEMENT PAGE
 * Grade and class listings, student counts per class, homeroom teacher assignments,
 * capacity checks, add/edit class forms, assign student modal, and duplicate ID validation.
 */

import { OrganizationMembership } from '../../../types/auth';
import { SchoolClass } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createClassesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const render = () => {
    rootWrapper.innerHTML = '';

    const classes = schoolStore.getClasses(orgId);
    const students = schoolStore.getStudents(orgId);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('classes', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} کلاس‌ها و ساختار آموزشی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `مدیریت ${classes.length.toLocaleString('fa-IR')} کلاس فعال، تخصیص معلمان راهنما، ظرفیت اتاق‌ها و تخصیص گروهی دانش‌آموزان.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ایجاد کلاس جدید`,
    });
    addBtn.addEventListener('click', () => openAddClassModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Classes Grid
    const grid = createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5',
    });

    if (classes.length === 0) {
      const emptyState = createElement('div', {
        className: 'col-span-full bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs space-y-2',
      });
      emptyState.innerHTML = `<div>هنوز هیچ کلاسی برای این مرکز ایجاد نشده است.</div>`;
      grid.appendChild(emptyState);
    } else {
      classes.forEach((cls) => {
        const classCard = createElement('div', {
          className:
            'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between',
        });

        const classStudents = students.filter((s) => s.classId === cls.id && s.status === 'active');
        const fillPercent = Math.min(100, Math.round((classStudents.length / cls.capacity) * 100));

        classCard.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="p-2 rounded-xl bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] font-bold text-xs">${cls.code}</span>
                <div>
                  <h3 class="font-semibold text-sm text-gray-900">${cls.name}</h3>
                  <div class="text-[11px] text-gray-500">${cls.gradeLevel}</div>
                </div>
              </div>
              <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold">اتاق ${cls.roomNumber}</span>
            </div>

            <div class="space-y-1.5 text-xs text-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">معلم راهنما:</span>
                <span class="font-bold text-gray-900">${cls.homeroomTeacherName || 'تعیین نشده'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">تعداد دانش‌آموزان:</span>
                <span class="font-bold text-[rgb(var(--theme-primary))] font-mono">${classStudents.length} از ${cls.capacity} نفر</span>
              </div>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-gray-500 font-semibold">
                <span>تکمیل ظرفیت</span>
                <span class="font-mono">٪${fillPercent}</span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="h-full ${fillPercent >= 100 ? 'bg-rose-500' : 'bg-[rgb(var(--theme-primary))]'} transition-all duration-500" style="width: ${fillPercent}%"></div>
              </div>
            </div>
          </div>
        `;

        // Card Actions
        const actionsRow = createElement('div', {
          className: 'pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs',
        });

        const assignBtn = createElement('button', {
          className:
            'px-3 py-1.5 bg-[rgb(var(--theme-subtle))] hover:bg-[#DDD6E3] text-[rgb(var(--theme-primary))] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer',
          innerHTML: `${getDashboardIcon('users', 'w-3.5 h-3.5')} تخصیص دانش‌آموز`,
        });
        assignBtn.addEventListener('click', () => openAssignStudentsModal(cls));

        const editBtn = createElement('button', {
          className: 'px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-bold transition-colors cursor-pointer',
          textContent: 'ویرایش',
        });
        editBtn.addEventListener('click', () => openEditClassModal(cls));

        actionsRow.appendChild(assignBtn);
        actionsRow.appendChild(editBtn);

        actionsRow.append(deleteAction('کلاس',()=>schoolStore.deleteClass(cls.id),render));
        classCard.appendChild(actionsRow);
        grid.appendChild(classCard);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openAddClassModal = () => {
    const staff = schoolStore.getStaff(orgId);
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کد شناسه کلاس *</label>
          <input type="text" id="cls-code" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" placeholder="مثال: CLS-102" />
        </div>
        <div>
          <label class="block font-bold mb-1">نام/عنوان کلاس *</label>
          <input type="text" id="cls-name" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="مثال: ۱۰/۲ تجربی" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">پایه تحصیلی *</label>
          <input type="text" id="cls-grade" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="مثال: پایه دهم" />
        </div>
        <div>
          <label class="block font-bold mb-1">معلم/دبیر راهنما</label>
          <select id="cls-[#teacher]" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="">انتخاب نشده</option>
            ${staff.map((st) => `<option value="${st.id}">${st.fullName} (${st.roleTitle})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">حداکثر ظرفیت کلاس *</label>
          <input type="number" id="cls-capacity" value="30" min="5" max="50" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
        <div>
          <label class="block font-bold mb-1">شماره اتاق/کلاس *</label>
          <input type="text" id="cls-room" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" placeholder="مثال: ۲۰۴" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'ایجاد کلاس جدید',
      content: form,
      confirmText: 'ایجاد کلاس',
      cancelText: 'انصراف',
      onConfirm: () => {
        const code = (form.querySelector('#cls-code') as HTMLInputElement).value.trim();
        const name = (form.querySelector('#cls-name') as HTMLInputElement).value.trim();
        const gradeLevel = (form.querySelector('#cls-grade') as HTMLInputElement).value.trim();
        const capacity = parseInt((form.querySelector('#cls-capacity') as HTMLInputElement).value, 10) || 30;
        const roomNumber = (form.querySelector('#cls-room') as HTMLInputElement).value.trim();
        const teacherSelect = form.querySelector('#cls-\\[teacher\\]') as HTMLSelectElement;
        const teacherId = teacherSelect ? teacherSelect.value : '';

        // Validation for duplicate class code
        const existingClasses = schoolStore.getClasses(orgId);
        if (existingClasses.some((c) => c.code.toLowerCase() === code.toLowerCase())) {
          showToast({ title: 'شناسه تکراری', message: 'کد شناسه‌ی کلاس وارد شده تکراری است.', type: 'error' });
          return;
        }

        if (!code || !name || !gradeLevel) {
          showToast({ title: 'فیلد خالی', message: 'لطفاً مشخصات الزامی را وارد کنید.', type: 'warning' });
          return;
        }

        const teacherObj = staff.find((st) => st.id === teacherId);

        schoolStore.addClass({
          organizationId: orgId,
          code,
          name,
          gradeLevel,
          capacity,
          roomNumber: roomNumber || '۱۰۱',
          homeroomTeacherId: teacherId,
          homeroomTeacherName: teacherObj ? teacherObj.fullName : 'تعیین نشده',
        });

        showToast({ title: 'ایجاد کلاس', message: `کلاس «${name}» با موفقیت افزوده شد.`, type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openEditClassModal = (cls: SchoolClass) => {
    const staff = schoolStore.getStaff(orgId);
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">نام/عنوان کلاس *</label>
          <input type="text" id="edit-cls-name" value="${cls.name}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
        <div>
          <label class="block font-bold mb-1">پایه تحصیلی *</label>
          <input type="text" id="edit-cls-grade" value="${cls.gradeLevel}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">معلم/دبیر راهنما</label>
          <select id="edit-cls-teacher" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="">تعیین نشده</option>
            ${staff
              .map(
                (st) =>
                  `<option value="${st.id}" ${st.id === cls.homeroomTeacherId ? 'selected' : ''}>${st.fullName} (${st.roleTitle})</option>`
              )
              .join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">شماره اتاق</label>
          <input type="text" id="edit-cls-room" value="${cls.roomNumber}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'ویرایش مشخصات کلاس',
      content: form,
      confirmText: 'ذخیره تغییرات',
      cancelText: 'انصراف',
      onConfirm: () => {
        const name = (form.querySelector('#edit-cls-name') as HTMLInputElement).value.trim();
        const gradeLevel = (form.querySelector('#edit-cls-grade') as HTMLInputElement).value.trim();
        const roomNumber = (form.querySelector('#edit-cls-room') as HTMLInputElement).value.trim();
        const teacherId = (form.querySelector('#edit-cls-teacher') as HTMLSelectElement).value;

        const teacherObj = staff.find((st) => st.id === teacherId);

        schoolStore.updateClass(cls.id, {
          name,
          gradeLevel,
          roomNumber,
          homeroomTeacherId: teacherId,
          homeroomTeacherName: teacherObj ? teacherObj.fullName : 'تعیین نشده',
        });

        showToast({ title: 'بروزرسانی', message: 'اطلاعات کلاس بروزرسانی شد.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openAssignStudentsModal = (cls: SchoolClass) => {
    const students = schoolStore.getStudents(orgId);
    const container = createElement('div', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    const currentRoster = students.filter((s) => s.classId === cls.id);
    const unassignedOrOther = students.filter((s) => s.classId !== cls.id);

    container.innerHTML = `
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <strong>لیست دانش‌آموزان فعلی کلاس (${cls.name}):</strong> ${currentRoster.length} نفر
      </div>
      <div class="space-y-2">
        <label class="block font-bold">انتخاب دانش‌آموز جهت انتقال به این کلاس:</label>
        <select id="assign-student-select" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
          ${unassignedOrOther
            .map((s) => `<option value="${s.id}">${s.fullName} - فعلی: ${s.className} (${s.studentCode})</option>`)
            .join('')}
        </select>
      </div>
    `;

    const modal = new Modal({
      title: `تخصیص دانش‌آموز به ${cls.name}`,
      content: container,
      confirmText: 'تخصیص به کلاس',
      cancelText: 'انصراف',
      onConfirm: () => {
        const selectEl = container.querySelector('#assign-student-select') as HTMLSelectElement;
        if (!selectEl || !selectEl.value) {
          showToast({ title: 'تخصیص', message: 'دانش‌آموزی انتخاب نشده است.', type: 'warning' });
          return;
        }

        const studentId = selectEl.value;
        schoolStore.updateStudent(studentId, {
          classId: cls.id,
          className: cls.name,
          gradeLevel: cls.gradeLevel,
        });

        showToast({ title: 'تخصیص موفق', message: 'دانش‌آموز به کلاس انتخابی انتقال یافت.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
