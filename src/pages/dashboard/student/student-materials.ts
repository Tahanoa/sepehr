import { notify } from '../../../components/feedback';
/**
 * POLARIS STUDENT LEARNING MATERIALS PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createStudentMaterialsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const materials = schoolStore.getMaterials(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('book', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} جزوات و منابع آموزشی
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">دانلود و مطالعه فایل‌ها و جزوات منتشر شده توسط اساتید دروس.</p>
    `;

    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' });

    if (materials.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white p-8 text-center border border-gray-200 rounded-2xl text-xs text-gray-500">محتوای آموزشی جدیدی موجود نیست.</div>`;
    } else {
      materials.forEach((mat) => {
        const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))]">${mat.category}</span>
              <span class="text-[10px] font-mono text-gray-400">${mat.uploadDate}</span>
            </div>
            <h3 class="font-semibold text-xs text-gray-900">${mat.title}</h3>
            <p class="text-[11px] text-gray-500 line-clamp-2">${mat.description}</p>
            <div class="bg-gray-50 p-2 rounded-xl text-[11px] text-gray-700 font-mono flex items-center justify-between">
              <span>📄 ${mat.fileName}</span>
              <span class="font-bold text-[rgb(var(--theme-primary))]">${mat.fileType} (${mat.fileSize})</span>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span class="text-[11px] text-gray-500">استاد: ${mat.uploadedBy}</span>
            <button class="dl-btn px-3 py-1.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-lg cursor-pointer">
              دانلود فایل
            </button>
          </div>
        `;

        const dlBtn = card.querySelector('.dl-btn') as HTMLButtonElement;
        dlBtn.addEventListener('click', () => {
          notify('فایل این منبع به سرویس ذخیره‌سازی متصل نیست؛ دانلودی انجام نشد.');
        });

        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(grid);
  };

  render();
  return rootWrapper;
}

