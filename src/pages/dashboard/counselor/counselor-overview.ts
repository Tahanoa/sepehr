/**
 * POLARIS SECONDARY SCHOOL COUNSELOR OVERVIEW PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { formatNumber } from '../../../utils/formatters';

export function createCounselorOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const referrals = schoolStore.getCounselingReferrals(orgId);
  const students = schoolStore.getStudents(orgId);

  const pendingCount = referrals.filter((r) => r.status === 'pending').length;
  const inProgressCount = referrals.filter((r) => r.status === 'in_progress').length;

  // Welcome Banner
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-purple rounded-2xl p-6 text-white shadow-md space-y-2',
  });
  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-brand-accent text-brand-primary text-xs font-black rounded-full">میز کار مشاور تحصیلی</span>
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
    <div class="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-2xs">
      <span class="text-xs font-bold text-muted-foreground">دانش‌آموزان تحت مشاوره</span>
      <div class="text-2xl font-black text-primary font-mono mt-1">${formatNumber(students.length)}</div>
    </div>
    <div class="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-2xs">
      <span class="text-xs font-bold text-muted-foreground">ارجاعات نیازمند پیگیری</span>
      <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">${formatNumber(pendingCount)}</div>
    </div>
    <div class="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-2xs">
      <span class="text-xs font-bold text-muted-foreground">جلسات در حال انجام</span>
      <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">${formatNumber(inProgressCount)}</div>
    </div>
    <div class="bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-2xs">
      <span class="text-xs font-bold text-muted-foreground">برنامه‌های تحصیلی فعال</span>
      <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">${formatNumber(28)} مورد</div>
    </div>
  `;

  // Referral List Card
  const listCard = createElement('div', { className: 'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-2xs space-y-3' });
  listCard.innerHTML = `<h3 class="text-xs sm:text-sm font-black text-foreground flex items-center gap-2">${getDashboardIcon('users', 'w-4 h-4 text-primary')} ارجاعات مشاوره‌ای اخیر دبیران</h3>`;

  const listBody = createElement('div', { className: 'space-y-2.5' });
  referrals.forEach((ref) => {
    const item = createElement('div', { className: 'p-4 bg-surface-subtle border border-border rounded-xl space-y-2 text-xs' });
    item.innerHTML = `
      <div class="flex items-center justify-between font-bold text-foreground border-b border-border pb-2">
        <span>${ref.studentName} (${ref.className})</span>
        <span class="px-2 py-0.5 rounded text-[10px] ${ref.priority === 'high' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}">
          اولویت: ${ref.priority === 'high' ? 'بالا' : 'متوسط'}
        </span>
      </div>
      <div class="text-muted-foreground"><strong>ارجاع‌دهنده:</strong> ${ref.referredBy} | <strong>تاریخ:</strong> ${ref.referralDate}</div>
      <div class="text-foreground"><strong>علت ارجاع:</strong> ${ref.reason}</div>
      ${ref.privateNotes ? `<div class="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mt-1"><strong>یادداشت خصوصی مشاور:</strong> ${ref.privateNotes}</div>` : ''}
    `;
    listBody.appendChild(item);
  });
  listCard.appendChild(listBody);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(statsGrid);
  rootWrapper.appendChild(listCard);

  return rootWrapper;
}
