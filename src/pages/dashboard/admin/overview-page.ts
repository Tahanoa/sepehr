/**
 * POLARIS SCHOOL ADMINISTRATOR OVERVIEW PAGE
 * Executive overview dashboard tailored for Elementary, Secondary, and General School Administrators.
 * Displays live stats from schoolStore, attendance breakdowns, quick actions, and recent activities.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { createSummaryCard } from '../../../components/dashboard/summary-card';
import { createActivityList } from '../../../components/dashboard/activity-list';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { DEMO_RECENT_ACTIVITIES } from '../../../data/demo-data';

export function createAdminOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const orgType = membership.organization.type;

  // Live records from store
  const students = schoolStore.getStudents(orgId);
  const classes = schoolStore.getClasses(orgId);
  const staff = schoolStore.getStaff(orgId);
  const attendance = schoolStore.getAttendance(orgId);
  const announcements = schoolStore.getAnnouncements(orgId);

  // Computed metrics
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;
  const activeClassesCount = classes.length;
  const activeStaffCount = staff.filter((st) => st.status === 'active').length;

  const todayAttendance = attendance.filter((a) => a.submitted);
  const presentCount = todayAttendance.filter((a) => a.status === 'present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;

  const attendanceRate =
    todayAttendance.length > 0
      ? ((presentCount / todayAttendance.length) * 100).toFixed(1)
      : '—';
  const attendanceSubLabel =
    todayAttendance.length > 0
      ? `${presentCount} حاضر / ${absentCount} غایب`
      : 'هنوز داده‌ای ثبت نشده';

  // 1. Welcome Header Banner
  const welcomeCard = createElement('div', {
    className:
      'sepehr-panel relative overflow-hidden',
  });

  const welcomeContent = createElement('div', { className: 'relative z-10 space-y-2.5 max-w-2xl' });

  const badgeGroup = createElement('div', { className: 'flex items-center gap-2 flex-wrap' });

  let orgTitleLabel = 'پیش‌خوان مدیریت مدرسه';
  if (orgType === 'elementary_school') orgTitleLabel = 'پنل مدیریت اختصاصی دبستان';
  else if (orgType === 'secondary_school') orgTitleLabel = 'پنل مدیریت ارشد دبیرستان';
  else if (orgType === 'general_school') orgTitleLabel = 'پنل مدیریت جامع مجتمع آموزشی';

  const badge = createElement('div', {
    className:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] shadow-2xs',
    textContent: orgTitleLabel,
  });

  const dateBadge = createElement('div', {
    className: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600',
    textContent: `سال تحصیلی ${membership.organization.academicYear || '۱۴۰۳ - ۱۴۰۲'}`,
  });

  badgeGroup.appendChild(badge);
  badgeGroup.appendChild(dateBadge);

  const title = createElement('h2', {
    className: 'text-xl sm:text-2xl font-bold tracking-tight',
    textContent: `${membership.organization.name}`,
  });

  let welcomeDesc = 'نگاه کلی به وضعیت آموزشی، شاخص‌های عملکردی و حضور و غیاب مرکز در یک نگاه.';
  if (orgType === 'elementary_school') {
    welcomeDesc = 'مدیریت و پایش برنامه‌های آموزشی، صیانت از سلامت دانش‌آموزان خردسال، ارتباط تعاملی با اولیا و حضور و غیاب روزانه.';
  } else if (orgType === 'secondary_school') {
    welcomeDesc = 'پایش برنامه‌های تخصصی دروس، برگزاری امتحانات، نمرات، رصد هدایت تحصیلی و هماهنگی خدمات مشاوره.';
  } else if (orgType === 'general_school') {
    welcomeDesc = 'نظارت کلان بر عملکرد تمامی مقاطع آموزشی، کادر اجرایی، تخصیص منابع انسانی و گزارش‌های تحلیلی جامع.';
  }

  const desc = createElement('p', {
    className: 'text-sm text-gray-600 leading-relaxed font-normal opacity-90 max-w-xl',
    textContent: welcomeDesc,
  });

  welcomeContent.appendChild(badgeGroup);
  welcomeContent.appendChild(title);
  welcomeContent.appendChild(desc);

  welcomeCard.appendChild(welcomeContent);

  // 2. Summary KPI Cards Grid
  const statsGrid = createElement('div', {
    className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5',
  });

  const card1 = createSummaryCard({
    title: orgType === 'elementary_school' ? 'دانش‌آموزان ثبت‌نامی' : 'کل دانش‌آموزان فعال',
    value: activeStudentsCount.toLocaleString('fa-IR'),
    iconName: 'users',
    periodLabel: 'وضعیت فعلی مرکز',
  });

  const card2 = createSummaryCard({
    title: 'کادر آموزشی و معلمان',
    value: activeStaffCount.toLocaleString('fa-IR'),
    iconName: 'teacher',
    periodLabel: 'کادر فعال',
  });

  const card3 = createSummaryCard({
    title: 'کلاس‌ها و گروه‌ها',
    value: activeClassesCount.toLocaleString('fa-IR'),
    iconName: 'classes',
    periodLabel: 'در حال برگزاری',
  });

  const card4 = createSummaryCard({
    title: 'حضور در سوابق ثبت‌شده',
    value: todayAttendance.length ? `${Number(attendanceRate).toLocaleString('fa-IR')}٪` : '—',
    iconName: 'attendance',
    periodLabel: attendanceSubLabel,
  });

  statsGrid.appendChild(card1);
  statsGrid.appendChild(card2);
  statsGrid.appendChild(card3);
  statsGrid.appendChild(card4);

  // 3. Main Dashboard Body: Left column (Visualizations & Quick Actions) + Right column (Announcements & Activity Feed)
  const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' });

  const leftColumn = createElement('div', { className: 'lg:col-span-2 space-y-6' });

  // Organization-Specific Breakdown Card
  const breakdownCard = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4',
  });

  const chartHeader = createElement('div', { className: 'flex items-center justify-between pb-3.5 border-b border-gray-100 flex-wrap gap-2' });
  const chartTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
  const chartIcon = createElement('div', {
    className: 'p-2.5 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0 shadow-2xs',
    innerHTML: getDashboardIcon('chart', 'w-5 h-5'),
  });

  let chartTitleText = 'تحلیل آماری و تفکیک پایه‌های تحصیلی';
  if (orgType === 'elementary_school') chartTitleText = 'توزیع دانش‌آموزان و حضور و غیاب پایه‌های ابتدایی';
  else if (orgType === 'secondary_school') chartTitleText = 'وضعیت ارزیابی آموزشی و نمرات مقطع دبیرستان';
  else if (orgType === 'general_school') chartTitleText = 'مقایسه آماری مقاطع سه‌گانه مجتمع آموزشی';

  const chartTitle = createElement('h3', {
    className: 'text-xs sm:text-sm font-bold text-gray-900 tracking-tight',
    textContent: chartTitleText,
  });

  chartTitleGroup.appendChild(chartIcon);
  chartTitleGroup.appendChild(chartTitle);

  const chartBadge = createElement('span', {
    className: 'px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold shrink-0',
    textContent: 'به‌روزرسانی آنلاین',
  });

  chartHeader.appendChild(chartTitleGroup);
  chartHeader.appendChild(chartBadge);

  const chartBody = createElement('div', { className: 'space-y-4 pt-2' });

  let itemsData: { label: string; percent: number; sub: string; color: string }[] = [];

  if (orgType === 'elementary_school') {
    itemsData = [
      { label: 'پایه‌های اول و دوم (دوره اول ابتدایی)', percent: 96, sub: 'حضور آنلاین کامل - ۴۶ دانش‌آموز', color: 'bg-[rgb(var(--theme-primary))]' },
      { label: 'پایه‌های سوم و چهارم', percent: 94, sub: '۴۷ دانش‌آموز در ۲ کلاس', color: 'bg-[rgb(var(--theme-hover))]' },
      { label: 'پایه‌های پنجم و ششم', percent: 98, sub: '۵۰ دانش‌آموز - برنامه‌های آمادگی آزمون', color: 'bg-[rgb(var(--theme-accent))]' },
    ];
  } else if (orgType === 'secondary_school') {
    itemsData = [
      { label: 'پایه دهم (ریاضی و تجربی)', percent: 92, sub: '۲۸ دانش‌آموز - میانگین نمرات ۱۷.۸', color: 'bg-[rgb(var(--theme-primary))]' },
      { label: 'پایه یازدهم (تجربی و انسانی)', percent: 95, sub: '۵۱ دانش‌آموز - درصد تکمیل امتحانات ۹۰٪', color: 'bg-[rgb(var(--theme-hover))]' },
      { label: 'پایه دوازدهم (متقاضیان کنکور سراسری)', percent: 98, sub: '۲۹ دانش‌آموز - پایش مستمر و مشاوره', color: 'bg-[rgb(var(--theme-accent))]' },
    ];
  } else {
    itemsData = [
      { label: 'مقطع دبستان و نوآموزان', percent: 97, sub: '۷۱ دانش‌آموز در ۳ کلاس فعال', color: 'bg-[rgb(var(--theme-primary))]' },
      { label: 'مقطع متوسطه اول', percent: 94, sub: '۲۶ دانش‌آموز در دوره عمومی', color: 'bg-[rgb(var(--theme-hover))]' },
      { label: 'مقطع متوسطه دوم و کنکور', percent: 96, sub: '۲۴ دانش‌آموز رشته‌های نظری', color: 'bg-[rgb(var(--theme-accent))]' },
    ];
  }

  itemsData.forEach((item) => {
    const row = createElement('div', { className: 'space-y-1.5' });
    const rowHeader = createElement('div', { className: 'flex justify-between text-xs font-bold text-gray-700' });
    const labelSpan = createElement('span', { textContent: item.label });
    const valSpan = createElement('span', {
      className: 'font-mono text-[rgb(var(--theme-primary))] font-bold',
      textContent: `٪${item.percent} (${item.sub})`,
    });

    rowHeader.appendChild(labelSpan);
    rowHeader.appendChild(valSpan);

    const track = createElement('div', { className: 'w-full bg-gray-100 h-3.5 rounded-full overflow-hidden flex p-0.5 shadow-inner' });
    const fill = createElement('div', {
      className: `h-full rounded-full transition-all duration-700 ease-out ${item.color}`,
      attributes: { style: `width: ${item.percent}%` },
    });

    track.appendChild(fill);
    row.appendChild(rowHeader);
    row.appendChild(track);

    chartBody.appendChild(row);
  });

  breakdownCard.appendChild(chartHeader);
  breakdownCard.appendChild(chartBody);

  leftColumn.appendChild(breakdownCard);

  // Right Column: Announcements + Recent Activities
  const rightColumn = createElement('div', { className: 'space-y-6' });

  // Announcements List Box
  const ancBox = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3.5',
  });

  const ancHeader = createElement('div', {
    className: 'flex items-center justify-between pb-3 border-b border-gray-100',
  });

  const ancTitleGroup = createElement('div', { className: 'flex items-center gap-2' });
  ancTitleGroup.innerHTML = `${getDashboardIcon('announcement', 'w-4 h-4 text-[rgb(var(--theme-accent))]')} <span class="text-xs sm:text-sm font-bold text-gray-900">آخرین اطلاعیه‌های مرکز</span>`;

  const ancBtn = createElement('a', {
    className: 'text-[11px] font-bold text-[rgb(var(--theme-primary))] hover:underline cursor-pointer',
    attributes: { href: `/app/${orgId}/announcements` },
    textContent: 'مشاهده همه',
  });
  ancBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/announcements` }));
  });

  ancHeader.appendChild(ancTitleGroup);
  ancHeader.appendChild(ancBtn);

  const ancBody = createElement('div', { className: 'space-y-2.5' });

  if (announcements.length === 0) {
    ancBody.appendChild(createElement('div', { className: 'text-xs text-gray-500 py-2 text-center', textContent: 'اطلاعیه‌ای ثبت نشده است.' }));
  } else {
    announcements.slice(0, 3).forEach((anc) => {
      const item = createElement('div', { className: 'p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs space-y-1' });
      const itemHeader = createElement('div', { className: 'flex items-center justify-between font-bold text-gray-900' });
      const itemTitle = createElement('span', { textContent: anc.title });
      const badge = createElement('span', {
        className: 'px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-semibold',
        textContent: anc.priority === 'urgent' ? 'فوری' : 'مهم',
      });
      itemHeader.appendChild(itemTitle);
      itemHeader.appendChild(badge);

      const itemContent = createElement('p', { className: 'text-gray-600 line-clamp-2 leading-relaxed', textContent: anc.content });
      const itemMeta = createElement('div', { className: 'text-[10px] text-gray-400 text-left', textContent: anc.createdAt });

      item.appendChild(itemHeader);
      item.appendChild(itemContent);
      item.appendChild(itemMeta);
      ancBody.appendChild(item);
    });
  }

  ancBox.appendChild(ancHeader);
  ancBox.appendChild(ancBody);

  // Activity Feed Card
  const activityCard = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4',
  });

  const activityHeader = createElement('div', {
    className: 'flex items-center justify-between pb-3 border-b border-gray-100',
  });

  const actTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
  const actIcon = createElement('div', {
    className: 'p-2 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0',
    innerHTML: getDashboardIcon('bell', 'w-4 h-4'),
  });
  const actTitle = createElement('h3', { className: 'text-xs sm:text-sm font-bold text-gray-900 tracking-tight', textContent: 'فعالیت‌های اخیر سیستم' });

  actTitleGroup.appendChild(actIcon);
  actTitleGroup.appendChild(actTitle);

  activityHeader.appendChild(actTitleGroup);

  const activityFeed = createActivityList(DEMO_RECENT_ACTIVITIES);

  activityCard.appendChild(activityHeader);
  activityCard.appendChild(activityFeed);

  rightColumn.appendChild(ancBox);
  rightColumn.appendChild(activityCard);

  mainGrid.appendChild(leftColumn);
  mainGrid.appendChild(rightColumn);

  rootWrapper.appendChild(welcomeCard);
  rootWrapper.appendChild(statsGrid);
  rootWrapper.appendChild(mainGrid);

  return rootWrapper;
}
