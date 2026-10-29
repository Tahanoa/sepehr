/**
 * POLARIS PROSPECTIVE APPLICANT OVERVIEW PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createApplicantOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const applications = schoolStore.getApplications(orgId);

  // Welcome Hero
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[rgb(var(--theme-primary))] via-[rgb(var(--theme-hover))] to-[rgb(var(--theme-secondary))] rounded-2xl p-6 text-white shadow-md space-y-2',
  });
  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] text-xs font-bold rounded-full">درخواست پذیرش آنلاین</span>
      <span class="text-xs text-amber-200">${membership.organization.name}</span>
    </div>
    <h2 class="text-2xl font-bold">به آموزشگاه تخصصی خوش آمدید</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      مشاهده کاتالوگ دوره‌های زبان و علوم، ثبت‌نام آنلاین، پرداخت اولیه شهریه دمو و پیگیری کد رهگیری پذیرش.
    </p>
  `;

  // Quick Action Links
  const grid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' });

  const links = [
    { title: 'کاتالوگ دوره‌ها و سطوح', desc: 'مشاهده برنامه‌ها، زمان‌بندی و اساتید', path: `/app/${orgId}/courses`, icon: 'book' },
    { title: 'ثبت‌نام و درخواست پذیرش', desc: 'تکمیل فرم آنلاین و انتخاب دوره', path: `/app/${orgId}/registration`, icon: 'assignment' },
    { title: 'پیگیری وضعیت و پرداخت', desc: 'مشاهده کد رهگیری و رسید شهریه', path: `/app/${orgId}/status`, icon: 'attendance' },
  ];

  links.forEach((link) => {
    const card = createElement('a', {
      attributes: { href: link.path },
      className: 'bg-white p-5 rounded-2xl border border-gray-200 hover:border-[rgb(var(--theme-primary))] hover:bg-gray-50 transition-all flex items-center gap-3 cursor-pointer text-right shadow-2xs',
    });
    card.innerHTML = `
      <div class="p-3 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0 font-bold">${getDashboardIcon(link.icon, 'w-6 h-6')}</div>
      <div>
        <h3 class="font-semibold text-xs text-gray-900">${link.title}</h3>
        <p class="text-[11px] text-gray-500 mt-1">${link.desc}</p>
      </div>
    `;
    card.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: link.path }));
    });
    grid.appendChild(card);
  });

  // Recent Applications Status
  const appCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3' });
  appCard.innerHTML = `<h3 class="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">${getDashboardIcon('assignment', 'w-4 h-4 text-[rgb(var(--theme-accent))]')} درخواست‌های پذیرش فعال شما</h3>`;

  const appBody = createElement('div', { className: 'space-y-2' });
  if (applications.length === 0) {
    appBody.innerHTML = `<div class="text-xs text-gray-500 py-4 text-center">هنوز درخواست پذیرشی ثبت نکرده‌اید.</div>`;
  } else {
    applications.forEach((app) => {
      const item = createElement('div', { className: 'p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs' });
      item.innerHTML = `
        <div class="flex items-center justify-between font-bold text-gray-900">
          <span>${app.courseName}</span>
          <span class="px-2.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-semibold">کد رهگیری: ${app.refCode}</span>
        </div>
        <div class="text-gray-600">نام متقاضی: ${app.applicantName} | تاریخ ثبت: ${app.submissionDate}</div>
        <div class="text-emerald-800 font-bold">وضعیت پذیرش: در انتظار تایید و تخصیص کلاس</div>
      `;
      appBody.appendChild(item);
    });
  }
  appCard.appendChild(appBody);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(grid);
  rootWrapper.appendChild(appCard);

  return rootWrapper;
}
