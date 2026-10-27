/**
 * POLARIS PARENT DASHBOARD OVERVIEW PAGE
 * Child selector, student overview, grades, attendance alerts, teacher announcements.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createParentOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const user = authService.getCurrentUser();

  const students = schoolStore.getStudents(orgId);
  // Pick linked student
  const child = students.find((s) => s.guardianName.includes('رضایی') || s.guardianName.includes('عباسی') || s.guardianName.includes('تهرانی')) || students[0];

  const attendance = schoolStore.getAttendance(orgId).filter((a) => child && a.studentId === child.id);
  const announcements = schoolStore.getAnnouncements(orgId);

  // Welcome Hero
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] rounded-2xl p-6 text-white shadow-md space-y-2',
  });

  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[#E98A15] text-[#012622] text-xs font-black rounded-full">پیش‌خوان اولیا و سرپرستان</span>
      <span class="text-xs text-amber-200">${membership.organization.name}</span>
    </div>
    <h2 class="text-2xl font-black">جناب آقای/خانم ${user?.name || 'ولی محترم'}</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      رصد وضعیت تحصیلی، انضباطی و برنامه‌های آموزشی فرزند تحت سرپرستی در سامانه پولاریس.
    </p>
  `;

  // Linked Child Summary Card
  const childCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3' });
  if (child) {
    childCard.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#012622] text-white flex items-center justify-center font-bold text-sm">
            ${child.fullName.slice(0, 1)}
          </div>
          <div>
            <h3 class="font-black text-sm text-gray-900">${child.fullName}</h3>
            <p class="text-xs text-gray-500">${child.className} (${child.gradeLevel})</p>
          </div>
        </div>
        <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">کد: ${child.studentCode}</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-700 pt-1">
        <div><strong>نسبت سرپرست:</strong> ${child.guardianRelation}</div>
        <div><strong>شماره تماس ثبت‌شده:</strong> <span class="font-mono">${child.guardianPhone}</span></div>
        <div><strong>سوابق غیبت:</strong> <span class="font-mono font-bold text-rose-800">${attendance.filter((a) => a.status === 'absent').length} مورد</span></div>
        <div><strong>وضعیت ثبت‌نام:</strong> فعال</div>
      </div>
    `;
  } else {
    childCard.innerHTML = `<div class="text-xs text-gray-500 text-center py-4">دانش‌آموز تحت سرپرستی یافت نشد.</div>`;
  }

  // Announcements
  const ancBox = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 space-y-3' });
  ancBox.innerHTML = `<h3 class="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-2">${getDashboardIcon('announcement', 'w-4 h-4 text-[#E98A15]')} اطلاعیه‌های ویژه اولیا</h3>`;

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
  rootWrapper.appendChild(childCard);
  rootWrapper.appendChild(ancBox);

  return rootWrapper;
}
