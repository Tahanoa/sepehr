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

    const headerRow = createElement('div', { className: 'pb-2 border-b border-border space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
        ${getDashboardIcon('book', 'w-6 h-6 text-primary')} جزوات و منابع آموزشی
      </h2>
      <p class="text-xs sm:text-sm text-muted-foreground">دانلود و مطالعه فایل‌ها و جزوات منتشر شده توسط اساتید دروس.</p>
    `;

    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' });

    if (materials.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-card p-8 text-center border border-border rounded-2xl text-xs text-muted-foreground">محتوای آموزشی جدیدی موجود نیست.</div>`;
    } else {
      materials.forEach((mat) => {
        const card = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-3 flex flex-col justify-between' });
        card.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">${mat.category}</span>
              <span class="text-[10px] font-mono text-muted-foreground">${mat.uploadDate}</span>
            </div>
            <h3 class="font-extrabold text-xs text-foreground">${mat.title}</h3>
            <p class="text-[11px] text-muted-foreground line-clamp-2">${mat.description}</p>
            <div class="bg-surface-subtle p-2 rounded-xl text-[11px] text-foreground font-mono flex items-center justify-between border border-border">
              <span>📄 ${mat.fileName}</span>
              <span class="font-bold text-primary">${mat.fileType} (${mat.fileSize})</span>
            </div>
          </div>

          <div class="pt-2 border-t border-border flex items-center justify-between">
            <span class="text-[11px] text-muted-foreground">استاد: ${mat.uploadedBy}</span>
            <button class="dl-btn px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-lg cursor-pointer">
              دانلود فایل
            </button>
          </div>
        `;

        const dlBtn = card.querySelector('.dl-btn') as HTMLButtonElement;
        dlBtn.addEventListener('click', () => {
          alert(`شبیه‌سازی دریافت فایل آموزشی: ${mat.fileName}\n(فایل به‌صورت محلی ذخیره گردید)`);
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
