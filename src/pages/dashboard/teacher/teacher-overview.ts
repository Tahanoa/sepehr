/**
 * POLARIS TEACHER & INSTRUCTOR OVERVIEW PAGE
 * Personalized overview for Elementary teachers, Secondary teachers, and Institute instructors.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createTeacherOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const isInstitute = membership.organization.type === 'independent_institute';

  const user = authService.getCurrentUser();

  const classes = schoolStore.getClasses(orgId);
  const assignments = schoolStore.getAssignments(orgId);
  const exams = schoolStore.getExams(orgId);
  const materials = schoolStore.getMaterials(orgId);

  // Welcome Card
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[rgb(var(--theme-primary))] via-[rgb(var(--theme-hover))] to-[rgb(var(--theme-secondary))] rounded-2xl p-6 text-white shadow-md space-y-2',
  });
  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] text-xs font-bold rounded-full">${isInstitute ? 'پیش‌خوان استاد / مدرس' : 'پیش‌خوان معلم / دبیر'}</span>
      <span class="text-xs text-amber-200">${membership.title || 'استاد کادر آموزشی'}</span>
    </div>
    <h2 class="text-2xl font-bold">خوش آمدید، ${user?.name || 'استاد محترم'}</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      مدیریت کلاس‌های تحصیلی، ثبت حضور و غیاب، بررسی تکالیف ارسالی دانش‌آموزان و استفاده از دستیار تصحیح هوشمند.
    </p>
  `;

  // Summary Metrics
  const metricsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-4 gap-4' });
  metricsGrid.innerHTML = `
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">${isInstitute ? 'دوره‌های تحت تدریس' : 'کلاس‌های انتسابی'}</span>
      <div class="text-2xl font-bold text-[rgb(var(--theme-primary))] font-mono mt-1">${classes.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">تکالیف فعال</span>
      <div class="text-2xl font-bold text-amber-800 font-mono mt-1">${assignments.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">آزمون‌های برنامه‌ریزی‌شده</span>
      <div class="text-2xl font-bold text-emerald-800 font-mono mt-1">${exams.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">جزوات و منابع آموزشی</span>
      <div class="text-2xl font-bold text-purple-900 font-mono mt-1">${materials.length.toLocaleString('fa-IR')}</div>
    </div>
  `;

  // Quick Action Links Grid
  const actionsCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 space-y-4' });
  actionsCard.innerHTML = `<h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">${getDashboardIcon('classes', 'w-4 h-4 text-[rgb(var(--theme-primary))]')} دسترسی‌های سریع آموزگار / مدرس</h3>`;

  const actionsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' });

  const links = [
    { title: 'ثبت حضور و غیاب کلاس', desc: 'ارزیابی حضور روزانه دانش‌آموزان', path: `/app/${orgId}/attendance`, icon: 'attendance' },
    { title: 'طراحی تکلیف و تصحیح', desc: 'تعریف تکلیف جدید و درج بازخورد', path: `/app/${orgId}/assignments`, icon: 'assignment' },
    { title: 'طراح آزمون و تصحیح AI', desc: 'ساخت آزمون و دستیار تصحیح تشریحی', path: `/app/${orgId}/exams`, icon: 'exam' },
  ];

  links.forEach((link) => {
    const btn = createElement('a', {
      attributes: { href: link.path },
      className: 'p-4 rounded-xl border border-gray-200 hover:border-[rgb(var(--theme-primary))] hover:bg-gray-50/80 transition-all flex items-center gap-3 text-right cursor-pointer',
    });
    btn.innerHTML = `
      <div class="p-2.5 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0 font-bold">${getDashboardIcon(link.icon, 'w-5 h-5')}</div>
      <div>
        <div class="font-semibold text-xs text-gray-900">${link.title}</div>
        <div class="text-[11px] text-gray-500 mt-0.5">${link.desc}</div>
      </div>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: link.path }));
    });
    actionsGrid.appendChild(btn);
  });

  actionsCard.appendChild(actionsGrid);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(metricsGrid);
  rootWrapper.appendChild(actionsCard);

  return rootWrapper;
}
