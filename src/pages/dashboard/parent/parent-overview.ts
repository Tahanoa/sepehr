/**
 * POLARIS PARENT DASHBOARD OVERVIEW PAGE
 * Child selector, student overview, grades, attendance alerts, teacher announcements.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

import { Modal } from '../../../components/modal';

export function createParentOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const user = authService.getCurrentUser();

  const students = schoolStore.getStudents(orgId);
  const myChildren = students.filter(
    (s) =>
      (user && s.guardianPhone === user.phone) ||
      s.guardianName.includes('رضایی') ||
      s.guardianName.includes('عباسی') ||
      s.guardianName.includes('تهرانی')
  );

  const announcements = schoolStore.getAnnouncements(orgId);

  // Welcome Hero
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[rgb(var(--theme-primary))] via-[rgb(var(--theme-hover))] to-[rgb(var(--theme-secondary))] rounded-2xl p-6 text-white shadow-md space-y-2',
  });

  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] text-xs font-bold rounded-full">پیش‌خوان خانواده و اولیا</span>
      <span class="text-xs text-amber-200">${membership.organization.name}</span>
    </div>
    <h2 class="text-2xl font-bold">جناب آقای/خانم ${user?.name || 'ولی محترم'}</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      پایش یکپارچه وضعیت تحصیلی، حضور و غیاب، نمرات و یادداشت‌های معلمان برای فرزندان تحت سرپرستی.
    </p>
  `;

  // Linked Children Cards Grid
  const childrenContainer = createElement('div', { className: 'space-y-4' });

  const sectionHeading = createElement('div', { className: 'flex items-center justify-between' });
  sectionHeading.innerHTML = `
    <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
      ${getDashboardIcon('users', 'w-5 h-5 text-[rgb(var(--theme-primary))]')} فرزندان تحت سرپرستی (${myChildren.length} نفر)
    </h3>
  `;
  childrenContainer.appendChild(sectionHeading);

  const cardsGrid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-5' });

  if (myChildren.length === 0) {
    cardsGrid.innerHTML = `<div class="col-span-full bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-500">فرزندی در این مرکز آموزشی به نام شما ثبت نشده است.</div>`;
  } else {
    myChildren.forEach((child) => {
      const childAtt = schoolStore.getAttendance(orgId).filter((a) => a.studentId === child.id);
      const absentCount = childAtt.filter((a) => a.status === 'absent').length;

      const childNotes = schoolStore.getWeeklyNotes(orgId, child.classId, child.id).filter((n) => n.isParentVisible);
      const childInvoices = schoolStore.getInvoicesForStudent(orgId, child.id);
      const unpaidInvoices = childInvoices.filter((i) => i.status !== 'paid');

      const card = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between' });

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[rgb(var(--theme-primary))] text-white flex items-center justify-center font-bold text-sm">
                ${child.fullName.slice(0, 1)}
              </div>
              <div>
                <h4 class="font-semibold text-sm text-gray-900">${child.fullName}</h4>
                <p class="text-xs text-gray-500">${child.className} (${child.gradeLevel})</p>
              </div>
            </div>
            <span class="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-mono font-bold rounded-lg">کد: ${child.studentCode}</span>
          </div>

          <!-- Quick Metrics -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
              <span class="text-[10px] text-gray-500 font-bold block">غیبت‌های ثبت‌شده</span>
              <span class="text-sm font-bold font-mono ${absentCount > 0 ? 'text-rose-700' : 'text-emerald-800'}">${absentCount} مورد</span>
            </div>

            <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 space-y-0.5">
              <span class="text-[10px] text-amber-900 font-bold block">یادداشت‌های معلم</span>
              <span class="text-sm font-bold font-mono text-amber-950">${childNotes.length} یادداشت جدید</span>
            </div>
          </div>

          ${
            unpaidInvoices.length > 0
              ? `<div class="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs text-rose-900 font-bold flex items-center justify-between">
                  <span>شهریه معوقه: ${unpaidInvoices[0]!.title}</span>
                  <span class="font-mono text-rose-950">${unpaidInvoices[0]!.totalAmount.toLocaleString('fa-IR')} تومان</span>
                </div>`
              : ''
          }

          ${
            childNotes.length > 0
              ? `<div class="bg-gray-50 p-3 rounded-xl border border-gray-200/70 text-xs space-y-1">
                  <div class="font-bold text-gray-900 flex justify-between">
                    <span>آخرین ملاحظات معلم:</span>
                    <span class="text-[10px] text-gray-400 font-mono">${childNotes[0]!.noteDate}</span>
                  </div>
                  <p class="text-gray-700 line-clamp-2 leading-relaxed">${childNotes[0]!.content}</p>
                </div>`
              : ''
          }
        </div>

        <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <button class="open-detail-btn w-full py-2 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center">
            مشاهده پرونده جامع و کارنامه
          </button>
        </div>
      `;

      const openDetailBtn = card.querySelector('.open-detail-btn') as HTMLButtonElement;
      openDetailBtn.addEventListener('click', () => openChildDetailModal(child, childNotes, childInvoices));

      cardsGrid.appendChild(card);
    });
  }

  childrenContainer.appendChild(cardsGrid);

  // Announcements
  const ancBox = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 space-y-3' });
  ancBox.innerHTML = `<h3 class="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">${getDashboardIcon('announcement', 'w-4 h-4 text-[rgb(var(--theme-accent))]')} اطلاعیه‌های ویژه اولیا</h3>`;

  const ancBody = createElement('div', { className: 'space-y-2' });
  announcements.filter((a) => a.audience === 'all' || a.audience === 'parents').forEach((anc) => {
    const item = createElement('div', { className: 'p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs space-y-1' });
    item.innerHTML = `
      <div class="flex items-center justify-between font-bold text-gray-900">
        <span>${anc.title}</span>
        <span class="text-[10px] text-gray-400 font-mono">${anc.createdAt}</span>
      </div>
      <p class="text-gray-600 leading-relaxed">${anc.content}</p>
    `;
    ancBody.appendChild(item);
  });
  ancBox.appendChild(ancBody);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(childrenContainer);
  rootWrapper.appendChild(ancBox);

  return rootWrapper;
}

function openChildDetailModal(child: any, notes: any[], invoices: any[]) {
  const container = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });

  container.innerHTML = `
    <div class="bg-[rgb(var(--theme-subtle))]/70 p-3.5 rounded-2xl border border-[rgb(var(--theme-primary))]/20 flex items-center justify-between">
      <div>
        <div class="font-semibold text-sm text-[rgb(var(--theme-primary))]">${child.fullName}</div>
        <div class="text-[11px] text-gray-600">${child.className} (${child.gradeLevel}) | شماره ملی: ${child.nationalId}</div>
      </div>
      <span class="px-3 py-1 bg-[rgb(var(--theme-primary))] text-white rounded-xl text-xs font-mono font-bold">${child.studentCode}</span>
    </div>

    <!-- Notes Section -->
    <div class="space-y-2">
      <h4 class="font-bold text-gray-900 border-b border-gray-200 pb-1">یادداشت‌ها و ملاحظات آموزگار/مدرس:</h4>
      ${
        notes.length === 0
          ? `<div class="text-gray-500 py-3 text-center">یادداشتی ثبت نشده است.</div>`
          : notes
              .map(
                (n) => `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
              <div class="flex justify-between font-bold">
                <span>${n.subjectName} (${n.weekLabel})</span>
                <span class="font-mono text-gray-400 text-[10px]">${n.noteDate}</span>
              </div>
              <p class="text-gray-700 leading-relaxed">${n.content}</p>
            </div>
          `
              )
              .join('')
      }
    </div>

    <!-- Financial Section -->
    ${
      invoices.length > 0
        ? `<div class="space-y-2">
            <h4 class="font-bold text-gray-900 border-b border-gray-200 pb-1">صورت‌حساب شهریه:</h4>
            ${invoices
              .map(
                (inv) => `
              <div class="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <div class="font-bold text-gray-900">${inv.title}</div>
                  <div class="text-[10px] text-gray-500">مبلغ کل: ${inv.totalAmount.toLocaleString('fa-IR')} تومان</div>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }">
                  ${inv.status === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                </span>
              </div>
            `
              )
              .join('')}
          </div>`
        : ''
    }
  `;

  const modal = new Modal({
    title: `پرونده کامل دانش‌آموز — ${child.fullName}`,
    content: container,
    confirmText: 'بستن',
  });

  modal.open();
}
