/**
 * POLARIS STUDENT & LEARNER OVERVIEW PAGE
 * Tailored homepage for Elementary students, Secondary students, and Institute learners.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createStudentOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const isInstitute = membership.organization.type === 'independent_institute';
  const isElementary = membership.organization.type === 'elementary_school';

  const user = authService.getCurrentUser();
  const students = schoolStore.getStudents(orgId);
  const currentStudent = students.find((s) => s.fullName === user?.name || s.id === 'std-s1' || s.id === 'std-e1' || s.id === 'std-inst-1') || students[0];

  const assignments = schoolStore.getAssignments(orgId);
  const mySubmissions = currentStudent ? schoolStore.getSubmissionsForStudent(orgId, currentStudent.id) : [];
  const pendingAssignments = assignments.filter((a) => !mySubmissions.some((s) => s.assignmentId === a.id));

  const exams = schoolStore.getExams(orgId);
  const materials = schoolStore.getMaterials(orgId);
  const announcements = schoolStore.getAnnouncements(orgId);
  const invoices = currentStudent && isInstitute ? schoolStore.getInvoicesForStudent(orgId, currentStudent.id) : [];

  let totalBalance = 0;
  invoices.forEach((inv) => {
    totalBalance += Math.max(0, inv.totalAmount - inv.paidAmount);
  });

  // Welcome Hero Banner
  const welcomeCard = createElement('div', {
    className: 'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] rounded-2xl p-6 text-white shadow-md space-y-2',
  });

  let titleLabel = isInstitute ? 'پیش‌خوان دانش‌پذیر آموزشگاه' : isElementary ? 'پیش‌خوان دانش‌آموز دبستان' : 'پیش‌خوان دانش‌آموز دبیرستان';

  welcomeCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-[#E98A15] text-[#012622] text-xs font-black rounded-full">${titleLabel}</span>
      <span class="text-xs text-amber-200">${currentStudent ? currentStudent.className + ' (' + currentStudent.gradeLevel + ')' : membership.organization.name}</span>
    </div>
    <h2 class="text-2xl font-black">سلام، ${user?.name || 'دانش‌آموز عزیز'} 👋</h2>
    <p class="text-xs text-gray-200 opacity-90 max-w-xl">
      به سامانه تعاملی پولاریس خوش آمدید. تکالیف، آزمون‌های آنلاین، برنامه‌ی کلاسی و کارنامه در دسترس شما قرار دارد.
    </p>
  `;

  // Quick Stats Row
  const statsGrid = createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-4' });

  statsGrid.innerHTML = `
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">تکالیف در انتظار تحویل</span>
      <div class="text-2xl font-black text-amber-800 font-mono mt-1">${pendingAssignments.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">آزمون‌های پیش‌رو</span>
      <div class="text-2xl font-black text-[#012622] font-mono mt-1">${exams.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">جزوات و منابع جدید</span>
      <div class="text-2xl font-black text-indigo-900 font-mono mt-1">${materials.length.toLocaleString('fa-IR')}</div>
    </div>
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <span class="text-xs font-bold text-gray-500">${isInstitute ? 'مانده شهریه قابل پرداخت' : 'وضعیت حضور و غیاب'}</span>
      <div class="text-lg font-black ${isInstitute && totalBalance > 0 ? 'text-rose-800' : 'text-emerald-800'} font-mono mt-1">
        ${isInstitute ? (totalBalance > 0 ? totalBalance.toLocaleString('fa-IR') + ' تومان' : 'تسویه شده') : '٪۹۸ حضور منظم'}
      </div>
    </div>
  `;

  // Quick Nav Actions
  const actionsCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 space-y-4' });
  actionsCard.innerHTML = `<h3 class="text-sm font-black text-gray-900 flex items-center gap-2">${getDashboardIcon('classes', 'w-4 h-4 text-[#012622]')} دسترسی سریع به بخش‌های اصلی</h3>`;

  const actionsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' });

  const links = [
    { title: 'برنامه هفتگی و زمان‌بندی', desc: 'مشاهده ساعت کلاس‌ها و اساتید', path: `/app/${orgId}/schedule`, icon: 'calendar' },
    { title: 'ارسال تکالیف و تمرین‌ها', desc: 'مشاهده تکالیف و ثبت پاسخ', path: `/app/${orgId}/assignments`, icon: 'assignment' },
    { title: 'آزمون‌های آنلاین', desc: 'شرکت در آزمون و مشاهده نتیجه', path: `/app/${orgId}/exams`, icon: 'exam' },
    { title: 'کارنامه و نمرات', desc: 'بررسی ارزیابی‌ها و بازخورد استاد', path: `/app/${orgId}/grades`, icon: 'award' },
    { title: 'منابع و فایل‌های آموزشی', desc: 'دانلود جزوات و ویدیوها', path: `/app/${orgId}/materials`, icon: 'book' },
  ];

  if (isInstitute) {
    links.push({ title: 'صورت‌حساب و شهریه', desc: 'مشاهده سوابق و پرداختی آنلاین', path: `/app/${orgId}/payments`, icon: 'payment' });
  }

  links.forEach((link) => {
    const btn = createElement('a', {
      attributes: { href: link.path },
      className: 'p-4 rounded-xl border border-gray-200 hover:border-[#012622] hover:bg-gray-50/80 transition-all flex items-center gap-3 text-right cursor-pointer',
    });
    btn.innerHTML = `
      <div class="p-2.5 bg-[#ECE5F0] text-[#012622] rounded-xl shrink-0 font-bold">${getDashboardIcon(link.icon, 'w-5 h-5')}</div>
      <div>
        <div class="font-extrabold text-xs text-gray-900">${link.title}</div>
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

  // Announcements List Box
  const ancBox = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 space-y-3' });
  ancBox.innerHTML = `<h3 class="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-2">${getDashboardIcon('announcement', 'w-4 h-4 text-[#E98A15]')} اطلاعیه‌ها و پیام‌های جدید مرکز</h3>`;

  const ancBody = createElement('div', { className: 'space-y-2' });
  if (announcements.length === 0) {
    ancBody.innerHTML = `<div class="text-xs text-gray-500 py-2">اطلاعیه جدیدی موجود نیست.</div>`;
  } else {
    announcements.slice(0, 2).forEach((anc) => {
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
  }
  ancBox.appendChild(ancBody);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(statsGrid);
  rootWrapper.appendChild(actionsCard);
  rootWrapper.appendChild(ancBox);

  return rootWrapper;
}
