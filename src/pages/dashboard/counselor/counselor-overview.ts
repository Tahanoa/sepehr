/**
 * POLARIS SECONDARY SCHOOL COUNSELOR OVERVIEW PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createCounselorOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const referrals = schoolStore.getCounselingReferrals(orgId);
  const students = schoolStore.getStudents(orgId);

  const pendingCount = referrals.filter((r) => r.status === 'pending').length;
  const inProgressCount = referrals.filter((r) => r.status === 'in_progress').length;

  // Welcome Banner
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] rounded-2xl p-6 text-white shadow-md space-y-2',
  });
  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[#E98A15] text-[#012622] text-xs font-black rounded-full">میز کار مشاور تحصیلی</span>
      <span class="text-xs text-amber-200">${membership.organization.name}</span>
    </div>
    <h2 class="text-2xl font-black">میز کار مشاوره و هماهنگی تحصیلی</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      رصد افت تحصیلی، برنامه‌ریزی کنکور، جلسات فردی و گروهی و مدیریت ارجاعات ارسالی از سوی دبیران.
    </p>
  `;

  // Stats Grid
  const statsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-4 gap-4' });
  statsGrid.innerHTML = `
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">دانش‌آموزان تحت مشاوره</span>
      <div class="text-2xl font-black text-[#012622] font-mono mt-1">${students.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">ارجاعات نیازمند پیگیری</span>
      <div class="text-2xl font-black text-rose-800 font-mono mt-1">${pendingCount.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">جلسات در حال انجام</span>
      <div class="text-2xl font-black text-amber-800 font-mono mt-1">${inProgressCount.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">برنامه‌های تحصیلی فعال</span>
      <div class="text-2xl font-black text-emerald-800 font-mono mt-1">۲۸ مورد</div>
    </div>
  `;

  // Referral List Card
  const listCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3' });
  listCard.innerHTML = `<h3 class="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-2">${getDashboardIcon('users', 'w-4 h-4 text-[#012622]')} ارجاعات مشاوره‌ای اخیر دبیران</h3>`;

  const listBody = createElement('div', { className: 'space-y-2.5' });
  referrals.forEach((ref) => {
    const item = createElement('div', { className: 'p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs' });
    item.innerHTML = `
      <div class="flex items-center justify-between font-bold text-gray-900 border-b border-gray-200 pb-2">
        <span>${ref.studentName} (${ref.className})</span>
        <span class="px-2 py-0.5 rounded text-[10px] ${ref.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
          اولویت: ${ref.priority === 'high' ? 'بالا' : 'متوسط'}
        </span>
      </div>
      <div><strong>ارجاع‌دهنده:</strong> ${ref.referredBy} | <strong>تاریخ:</strong> ${ref.referralDate}</div>
      <div><strong>علت ارجاع:</strong> ${ref.reason}</div>
      ${ref.privateNotes ? `<div class="bg-indigo-50/80 p-2 rounded-lg text-indigo-900 mt-1"><strong>یادداشت خصوصی مشاور:</strong> ${ref.privateNotes}</div>` : ''}
    `;
    listBody.appendChild(item);
  });
  listCard.appendChild(listBody);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(statsGrid);
  rootWrapper.appendChild(listCard);

  return rootWrapper;
}
