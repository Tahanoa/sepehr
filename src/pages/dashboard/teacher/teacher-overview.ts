/**
 * POLARIS TEACHER & INSTRUCTOR OVERVIEW PAGE
 * Personalized overview for Elementary teachers, Secondary teachers, and Institute instructors with dark mode support.
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
    className: 'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] dark:from-[#071513] dark:via-[#002824] dark:to-[#380A30] rounded-2xl p-6 text-white shadow-md space-y-2',
  });
  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[#E98A15] text-[#012622] text-xs font-black rounded-full">${isInstitute ? 'پیش‌خوان استاد / مدرس' : 'پیش‌خوان معلم / دبیر'}</span>
      <span class="text-xs text-amber-200">${membership.title || 'استاد کادر آموزشی'}</span>
    </div>
    <h2 class="text-2xl font-black">خوش آمدید، ${user?.name || 'استاد محترم'}</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      مدیریت کلاس‌های تحصیلی، ثبت حضور و غیاب، بررسی تکالیف ارسالی دانش‌آموزان و استفاده از دستیار تصحیح هوشمند.
    </p>
  `;

  // Summary Metrics
  const metricsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-4 gap-4' });
  metricsGrid.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-1">
      <span class="text-xs font-bold text-gray-500 dark:text-gray-400">${isInstitute ? 'دوره‌های تحت تدریس' : 'کلاس‌های انتسابی'}</span>
      <div class="text-2xl font-black text-[#012622] dark:text-teal-300 font-mono mt-1">${classes.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-1">
      <span class="text-xs font-bold text-gray-500 dark:text-gray-400">تکالیف فعال</span>
      <div class="text-2xl font-black text-amber-800 dark:text-amber-300 font-mono mt-1">${assignments.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-1">
      <span class="text-xs font-bold text-gray-500 dark:text-gray-400">آزمون‌های برنامه‌ریزی‌شده</span>
      <div class="text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono mt-1">${exams.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs space-y-1">
      <span class="text-xs font-bold text-gray-500 dark:text-gray-400">جزوات و منابع آموزشی</span>
      <div class="text-2xl font-black text-purple-900 dark:text-purple-300 font-mono mt-1">${materials.length.toLocaleString('fa-IR')}</div>
    </div>
  `;

  // Quick Action Links Grid
  const actionsCard = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4' });
  actionsCard.innerHTML = `<h3 class="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">${getDashboardIcon('classes', 'w-4 h-4 text-[#012622] dark:text-teal-400')} دسترسی‌های سریع آموزگار / مدرس</h3>`;

  const actionsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' });

  const links = [
    { title: 'ثبت حضور و غیاب کلاس', desc: 'ارزیابی حضور روزانه دانش‌آموزان', path: `/app/${orgId}/attendance`, icon: 'attendance' },
    { title: 'طراحی تکلیف و تصحیح', desc: 'تعریف تکلیف جدید و درج بازخورد', path: `/app/${orgId}/assignments`, icon: 'assignment' },
    { title: 'طراح آزمون و تصحیح AI', desc: 'ساخت آزمون و دستیار تصحیح تشریحی', path: `/app/${orgId}/exams`, icon: 'exam' },
  ];

  links.forEach((link) => {
    const btn = createElement('a', {
      attributes: { href: link.path },
      className: 'p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#012622] dark:hover:border-teal-400 hover:bg-gray-50/80 dark:hover:bg-gray-750 transition-all flex items-center gap-3 text-right cursor-pointer',
    });
    btn.innerHTML = `
      <div class="p-2.5 bg-[#ECE5F0] dark:bg-gray-700 text-[#012622] dark:text-teal-300 rounded-xl shrink-0 font-bold">${getDashboardIcon(link.icon, 'w-5 h-5')}</div>
      <div>
        <div class="font-extrabold text-xs text-gray-900 dark:text-gray-100">${link.title}</div>
        <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">${link.desc}</div>
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
