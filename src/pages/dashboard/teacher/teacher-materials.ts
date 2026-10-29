/**
 * POLARIS TEACHER LEARNING MATERIALS PAGE
 * File uploads, categories (جزوه، ویدیو، تمرین), file metadata, open/download simulation, and deletion with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createTeacherMaterialsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const materials = schoolStore.getMaterials(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    headerText.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
        ${getDashboardIcon('book', 'w-6 h-6 text-[#012622] dark:text-teal-400')} کتابخانه و منابع آموزشی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">بارگذاری جزوات، ویدیوهای آموزشی و فایل‌های تمرینی برای کلاس‌های انتسابی.</p>
    `;

    const addBtn = createElement('button', {
      className: 'px-4 py-2.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> بارگذاری محتوای جدید`,
    });
    addBtn.addEventListener('click', () => openUploadMaterialModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Materials Grid
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' });

    if (materials.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white dark:bg-gray-800 p-8 text-center border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-500 dark:text-gray-400">هنوز محتوای آموزشی ثبت نشده است.</div>`;
    } else {
      materials.forEach((mat) => {
        const card = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ECE5F0] dark:bg-gray-700 text-[#012622] dark:text-teal-300">${mat.category}</span>
              <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500">${mat.uploadDate}</span>
            </div>
            <h3 class="font-extrabold text-xs text-gray-900 dark:text-gray-100 leading-snug">${mat.title}</h3>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">${mat.description}</p>
            <div class="bg-gray-50 dark:bg-gray-900/60 p-2 rounded-xl text-[11px] text-gray-700 dark:text-gray-300 font-mono flex items-center justify-between">
              <span>📄 ${mat.fileName}</span>
              <span class="font-bold text-[#012622] dark:text-teal-300">${mat.fileType} (${mat.fileSize})</span>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <button class="dl-btn px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg cursor-pointer">
              دانلود / پیش‌نمایش
            </button>
            <button class="del-btn p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        `;

        const dlBtn = card.querySelector('.dl-btn') as HTMLButtonElement;
        const delBtn = card.querySelector('.del-btn') as HTMLButtonElement;

        dlBtn.addEventListener('click', () => {
          alert(`شبیه‌سازی دانلود فایل: ${mat.fileName}\n(فایل به‌صورت محلی در سامانه ذخیره شده است)`);
        });

        delBtn.addEventListener('click', () => {
          if (confirm(`آیا از حذف محتوای «${mat.title}» اطمینان دارید؟`)) {
            schoolStore.deleteMaterial(mat.id);
            showToast({ title: 'حذف گردید', message: 'محتوا حذف شد.', type: 'info' });
            render();
          }
        });

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  const openUploadMaterialModal = () => {
    const form = createElement('form', { className: 'space-y-3.5 text-xs text-gray-800 dark:text-gray-200 dir-rtl' });
    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">عنوان فایل آموزشی *</label>
        <input type="text" id="mat-title" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100" placeholder="مثال: جزوه خلاصه نکات فرمول‌های مشتق" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس انتسابی</label>
          <select id="mat-classId" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100">
            ${classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">دسته‌بندی محتوا</label>
          <select id="mat-category" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100">
            <option value="جزوه آموزشی">جزوه آموزشی (PDF)</option>
            <option value="محتوای مالتی‌مدیا">ویدیو / فایل صوتی</option>
            <option value="فایل تمرینی">فایل تمرین و نمونه سوال</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">توضیحات خلاصه</label>
        <textarea id="mat-desc" rows="2" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100" placeholder="توضیحات کاربردی در مورد محتوا..."></textarea>
      </div>

      <div>
        <label class="block font-bold mb-1">انتخاب فایل از رایانه *</label>
        <input type="file" id="mat-file" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" />
        <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">توضیح: فایل انتخابی محلی جهت شبیه‌سازی بارگذاری ذخیره خواهد شد.</p>
      </div>
    `;

    const modal = new Modal({
      title: 'بارگذاری محتوای آموزشی جدید',
      content: form,
      confirmText: 'آپلود و انتشار',
      cancelText: 'انصراف',
      onConfirm: () => {
        const title = (form.querySelector('#mat-title') as HTMLInputElement).value.trim();
        const classId = (form.querySelector('#mat-classId') as HTMLSelectElement).value;
        const category = (form.querySelector('#mat-category') as HTMLSelectElement).value;
        const description = (form.querySelector('#mat-desc') as HTMLTextAreaElement).value.trim();
        const fileInput = form.querySelector('#mat-file') as HTMLInputElement;

        const file = fileInput.files?.[0];
        const fileName = file ? file.name : 'Document.pdf';
        const fileType = file ? file.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF';
        const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} مگابایت` : '۲.۴ مگابایت';

        const selectedClass = classes.find((c) => c.id === classId) || classes[0];

        const payload: any = {
          organizationId: orgId,
          title,
          description,
          category,
          fileType,
          fileSize,
          fileName,
          uploadedBy: authService.getCurrentUser()?.name || 'استاد آموزگار',
        };
        if (selectedClass) {
          payload.classId = selectedClass.id;
          payload.className = selectedClass.name;
        }

        schoolStore.addMaterial(payload);

        showToast({ title: 'فایل بارگذاری شد', message: 'محتوای جدید با موفقیت منتشر گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
