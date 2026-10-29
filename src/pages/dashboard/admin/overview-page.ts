/**
 * POLARIS SCHOOL ADMINISTRATOR OVERVIEW PAGE
 * Executive overview dashboard tailored for Elementary, Secondary, and General School Administrators with dark mode support.
 * Displays live stats from schoolStore, attendance breakdowns, quick actions, and recent activities.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { createSummaryCard } from '../../../components/dashboard/summary-card';
import { createQuickAction } from '../../../components/dashboard/quick-action';
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
      : '۹۶.۴';
  const attendanceSubLabel =
    todayAttendance.length > 0
      ? `${presentCount} حاضر / ${absentCount} غایب`
      : 'ارزیابی ۳۰ روز اخیر';

  // 1. Welcome Header Banner
  const welcomeCard = createElement('div', {
    className:
      'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] dark:from-[#071513] dark:via-[#002824] dark:to-[#380A30] rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden',
  });

  const welcomeContent = createElement('div', { className: 'relative z-10 space-y-2.5 max-w-2xl' });

  const badgeGroup = createElement('div', { className: 'flex items-center gap-2 flex-wrap' });

  let orgTitleLabel = 'پیش‌خوان مدیریت مدرسه';
  if (orgType === 'elementary_school') orgTitleLabel = 'پنل مدیریت اختصاصی دبستان';
  else if (orgType === 'secondary_school') orgTitleLabel = 'پنل مدیریت ارشد دبیرستان';
  else if (orgType === 'general_school') orgTitleLabel = 'پنل مدیریت جامع مجتمع آموزشی';

  const badge = createElement('div', {
    className:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#E98A15] text-[#012622] shadow-2xs',
    textContent: orgTitleLabel,
  });

  const dateBadge = createElement('div', {
    className: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white',
    textContent: `سال تحصیلی ${membership.organization.academicYear || '۱۴۰۳ - ۱۴۰۲'}`,
  });

  badgeGroup.appendChild(badge);
  badgeGroup.appendChild(dateBadge);

  const title = createElement('h2', {
    className: 'text-xl sm:text-2xl lg:text-3xl font-black tracking-tight',
    textContent: `خوش آمدید، ${membership.organization.name}`,
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
    className: 'text-xs sm:text-sm text-gray-200 leading-relaxed font-normal opacity-90 max-w-xl',
    textContent: welcomeDesc,
  });

  welcomeContent.appendChild(badgeGroup);
  welcomeContent.appendChild(title);
  welcomeContent.appendChild(desc);

  const bgPattern = createElement('div', {
    className: 'absolute end-0 top-0 bottom-0 opacity-10 pointer-events-none p-6 hidden sm:block',
    innerHTML: `<svg class="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  });

  welcomeCard.appendChild(welcomeContent);
  welcomeCard.appendChild(bgPattern);

  // 2. Summary KPI Cards Grid
  const statsGrid = createElement('div', {
    className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5',
  });

  const card1 = createSummaryCard({
    title: orgType === 'elementary_school' ? 'دانش‌آموزان ثبت‌نامی' : 'کل دانش‌آموزان فعال',
    value: activeStudentsCount > 0 ? activeStudentsCount.toLocaleString('fa-IR') : '۱,۴۵۰',
    iconName: 'users',
    changePercent: 8.5,
    changeType: 'increase',
    periodLabel: 'نسبت به ترم قبل',
  });

  const card2 = createSummaryCard({
    title: 'کادر آموزشی و معلمان',
    value: activeStaffCount > 0 ? activeStaffCount.toLocaleString('fa-IR') : '۶۸',
    iconName: 'teacher',
    changePercent: 2.1,
    changeType: 'increase',
    periodLabel: 'کادر فعال',
  });

  const card3 = createSummaryCard({
    title: 'کلاس‌ها و گروه‌ها',
    value: activeClassesCount > 0 ? activeClassesCount.toLocaleString('fa-IR') : '۴۲',
    iconName: 'classes',
    changePercent: 0,
    changeType: 'neutral',
    periodLabel: 'در حال برگزاری',
  });

  const card4 = createSummaryCard({
    title: 'نرخ حضور و غیاب',
    value: `٪${attendanceRate}`,
    iconName: 'attendance',
    changePercent: 1.4,
    changeType: 'increase',
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
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 sm:p-6 shadow-2xs space-y-4',
  });

  const chartHeader = createElement('div', { className: 'flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-700 flex-wrap gap-2' });
  const chartTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
  const chartIcon = createElement('div', {
    className: 'p-2.5 bg-[#ECE5F0] dark:bg-gray-700 text-[#012622] dark:text-teal-300 rounded-xl shrink-0 shadow-2xs',
    innerHTML: getDashboardIcon('chart', 'w-5 h-5'),
  });

  let chartTitleText = 'تحلیل آماری و تفکیک پایه‌های تحصیلی';
  if (orgType === 'elementary_school') chartTitleText = 'توزیع دانش‌آموزان و حضور و غیاب پایه‌های ابتدایی';
  else if (orgType === 'secondary_school') chartTitleText = 'وضعیت ارزیابی آموزشی و نمرات مقطع دبیرستان';
  else if (orgType === 'general_school') chartTitleText = 'مقایسه آماری مقاطع سه‌گانه مجتمع آموزشی';

  const chartTitle = createElement('h3', {
    className: 'text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight',
    textContent: chartTitleText,
  });

  chartTitleGroup.appendChild(chartIcon);
  chartTitleGroup.appendChild(chartTitle);

  const chartBadge = createElement('span', {
    className: 'px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold shrink-0',
    textContent: 'به‌روزرسانی آنلاین',
  });

  chartHeader.appendChild(chartTitleGroup);
  chartHeader.appendChild(chartBadge);

  const chartBody = createElement('div', { className: 'space-y-4 pt-2' });

  let itemsData: { label: string; percent: number; sub: string; color: string }[] = [];

  if (orgType === 'elementary_school') {
    itemsData = [
      { label: 'پایه‌های اول و دوم (دوره اول ابتدایی)', percent: 96, sub: 'حضور آنلاین کامل - ۴۶ دانش‌آموز', color: 'bg-[#012622] dark:bg-teal-600' },
      { label: 'پایه‌های سوم و چهارم', percent: 94, sub: '۴۷ دانش‌آموز در ۲ کلاس', color: 'bg-[#003B36] dark:bg-teal-700' },
      { label: 'پایه‌های پنجم و ششم', percent: 98, sub: '۵۰ دانش‌آموز - برنامه‌های آمادگی آزمون', color: 'bg-[#E98A15]' },
    ];
  } else if (orgType === 'secondary_school') {
    itemsData = [
      { label: 'پایه دهم (ریاضی و تجربی)', percent: 92, sub: '۲۸ دانش‌آموز - میانگین نمرات ۱۷.۸', color: 'bg-[#012622] dark:bg-teal-600' },
      { label: 'پایه یازدهم (تجربی و انسانی)', percent: 95, sub: '۵۱ دانش‌آموز - درصد تکمیل امتحانات ۹۰٪', color: 'bg-[#003B36] dark:bg-teal-700' },
      { label: 'پایه دوازدهم (متقاضیان کنکور سراسری)', percent: 98, sub: '۲۹ دانش‌آموز - پایش مستمر و مشاوره', color: 'bg-[#E98A15]' },
    ];
  } else {
    itemsData = [
      { label: 'مقطع دبستان و نوآموزان', percent: 97, sub: '۷۱ دانش‌آموز در ۳ کلاس فعال', color: 'bg-[#012622] dark:bg-teal-600' },
      { label: 'مقطع متوسطه اول', percent: 94, sub: '۲۶ دانش‌آموز در دوره عمومی', color: 'bg-[#003B36] dark:bg-teal-700' },
      { label: 'مقطع متوسطه دوم و کنکور', percent: 96, sub: '۲۴ دانش‌آموز رشته‌های نظری', color: 'bg-[#E98A15]' },
    ];
  }

  itemsData.forEach((item) => {
    const row = createElement('div', { className: 'space-y-1.5' });
    const rowHeader = createElement('div', { className: 'flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300' });
    const labelSpan = createElement('span', { textContent: item.label });
    const valSpan = createElement('span', {
      className: 'text-xs font-medium flex items-center gap-1.5',
    });
    const percSpan = createElement('span', {
      className: 'text-[#012622] dark:text-teal-400 font-black',
      textContent: `٪${item.percent.toLocaleString('fa-IR')}`,
    });
    const subSpan = createElement('span', {
      className: 'text-gray-500 dark:text-gray-400 text-[11px]',
      textContent: `(${item.sub})`,
    });
    valSpan.appendChild(percSpan);
    valSpan.appendChild(subSpan);

    rowHeader.appendChild(labelSpan);
    rowHeader.appendChild(valSpan);

    const track = createElement('div', { className: 'w-full bg-gray-100 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden flex p-0.5 shadow-inner' });
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

  // Quick Actions Section
  const actionsCard = createElement('div', { className: 'space-y-3.5' });
  const actionsHeader = createElement('h3', {
    className: 'text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2',
  });
  actionsHeader.innerHTML = `${getDashboardIcon('classes', 'w-4 h-4 text-[#012622] dark:text-teal-400')} میان‌برهای عملیاتی و دسترسی سریع`;

  const actionsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' });

  const act1 = createQuickAction({
    id: 'act-students',
    title: 'مدیریت دانش‌آموزان',
    description: 'پرونده‌های تحصیلی، ثبت‌نام جدید و ویرایش مشخصات',
    iconName: 'users',
    path: `/app/${orgId}/students`,
  });

  const act2 = createQuickAction({
    id: 'act-attendance',
    title: 'حضور و غیاب',
    description: 'ثبت آنلاین وضعیت حضور، غیبت و تأخیر ورودی',
    iconName: 'attendance',
    path: `/app/${orgId}/attendance`,
  });

  let act3Title = 'برنامه‌ریزی کلاس‌ها';
  let act3Desc = 'زمان‌بندی دروس و تخصیص ظرفیت اتاق‌ها';
  let act3Path = `/app/${orgId}/classes`;
  let act3Icon = 'classes';

  if (orgType === 'secondary_school') {
    act3Title = 'امتحانات و آزمون‌ها';
    act3Desc = 'برنامه‌ریزی آزمون‌های مستمر و تداخل‌سنجی';
    act3Path = `/app/${orgId}/exams`;
    act3Icon = 'exam';
  }

  const act3 = createQuickAction({
    id: 'act-3',
    title: act3Title,
    description: act3Desc,
    iconName: act3Icon,
    path: act3Path,
  });

  let act4Title = 'کارنامه‌ها و نمرات';
  let act4Desc = 'بررسی کارنامه‌های توصیفی و عددی دانش‌آموزان';
  let act4Path = `/app/${orgId}/grades`;
  let act4Icon = 'award';

  if (orgType === 'secondary_school') {
    act4Title = 'خدمات مشاوره';
    act4Desc = 'مدیریت ارجاعات مشاوره‌ای و نوبت‌های تحصیلی';
    act4Path = `/app/${orgId}/counseling`;
    act4Icon = 'chat';
  }

  const act4 = createQuickAction({
    id: 'act-4',
    title: act4Title,
    description: act4Desc,
    iconName: act4Icon,
    path: act4Path,
  });

  actionsGrid.appendChild(act1);
  actionsGrid.appendChild(act2);
  actionsGrid.appendChild(act3);
  actionsGrid.appendChild(act4);

  actionsCard.appendChild(actionsHeader);
  actionsCard.appendChild(actionsGrid);

  leftColumn.appendChild(breakdownCard);
  leftColumn.appendChild(actionsCard);

  // Right Column: Announcements + Recent Activities
  const rightColumn = createElement('div', { className: 'space-y-6' });

  // Announcements List Box
  const ancBox = createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-3.5',
  });

  const ancHeader = createElement('div', {
    className: 'flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700',
  });

  const ancTitleGroup = createElement('div', { className: 'flex items-center gap-2' });
  ancTitleGroup.innerHTML = `${getDashboardIcon('announcement', 'w-4 h-4 text-[#E98A15]')} <span class="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100">آخرین اطلاعیه‌های مرکز</span>`;

  const ancBtn = createElement('a', {
    className: 'text-[11px] font-bold text-[#012622] dark:text-teal-400 hover:underline cursor-pointer',
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
    ancBody.appendChild(createElement('div', { className: 'text-xs text-gray-500 dark:text-gray-400 py-2 text-center', textContent: 'اطلاعیه‌ای ثبت نشده است.' }));
  } else {
    announcements.slice(0, 3).forEach((anc) => {
      const item = createElement('div', { className: 'p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700 text-xs space-y-1' });
      const itemHeader = createElement('div', { className: 'flex items-center justify-between font-bold text-gray-900 dark:text-gray-100' });
      const itemTitle = createElement('span', { textContent: anc.title });
      const badge = createElement('span', {
        className: 'px-2 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-extrabold',
        textContent: anc.priority === 'urgent' ? 'فوری' : 'مهم',
      });
      itemHeader.appendChild(itemTitle);
      itemHeader.appendChild(badge);

      const itemContent = createElement('p', { className: 'text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed', textContent: anc.content });
      const itemMeta = createElement('div', { className: 'text-[10px] text-gray-400 dark:text-gray-500 text-left', textContent: anc.createdAt });

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
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-4',
  });

  const activityHeader = createElement('div', {
    className: 'flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700',
  });

  const actTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
  const actIcon = createElement('div', {
    className: 'p-2 bg-[#ECE5F0] dark:bg-gray-700 text-[#012622] dark:text-teal-300 rounded-xl shrink-0',
    innerHTML: getDashboardIcon('bell', 'w-4 h-4'),
  });
  const actTitle = createElement('h3', { className: 'text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight', textContent: 'فعالیت‌های اخیر سیستم' });

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
