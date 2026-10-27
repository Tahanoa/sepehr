/**
 * POLARIS SCHOOL ADMINISTRATOR OVERVIEW PAGE
 * Executive overview dashboard for school administrators with KPI summary cards,
 * recent activity feed, quick action links, accessible attendance breakdown, and demo notice.
 */

import { createElement } from '../../utils/dom';
import { OrganizationMembership } from '../../types/auth';
import { createSummaryCard } from '../../components/dashboard/summary-card';
import { createQuickAction } from '../../components/dashboard/quick-action';
import { createActivityList } from '../../components/dashboard/activity-list';
import { getDashboardIcon } from '../../components/dashboard/icons';
import { DEMO_RECENT_ACTIVITIES } from '../../data/demo-data';

export function createAdminOverviewPage(membership: OrganizationMembership): HTMLElement {
  const container = createElement('div', { className: 'space-y-6 dir-rtl' });

  // 1. Welcome & Demo Banner Header
  const welcomeCard = createElement('div', {
    className:
      'bg-gradient-to-br from-[#012622] via-[#003B36] to-[#59114D] rounded-2xl p-6 text-white shadow-md relative overflow-hidden',
  });

  const welcomeContent = createElement('div', { className: 'relative z-10 space-y-2 max-w-2xl' });

  const badge = createElement('div', {
    className:
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#E98A15] text-[#012622] shadow-xs',
    textContent: 'پنل مدیریت ارشد مرکز',
  });

  const title = createElement('h2', {
    className: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    textContent: `خوش آمدید، ${membership.organization.name}`,
  });

  const desc = createElement('p', {
    className: 'text-xs sm:text-sm text-gray-200 leading-relaxed font-normal opacity-90',
    textContent:
      'نگاه کلی به وضعیت آموزشی، آمار شاخص‌های کلیدی عملکرد، حضور و غیاب مرکز و فعالیت‌های اخیر در یک نگاه.',
  });

  welcomeContent.appendChild(badge);
  welcomeContent.appendChild(title);
  welcomeContent.appendChild(desc);

  // Decorative SVG background pattern
  const bgPattern = createElement('div', {
    className: 'absolute end-0 top-0 bottom-0 opacity-10 pointer-events-none p-6 hidden sm:block',
    innerHTML: `<svg class="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  });

  welcomeCard.appendChild(welcomeContent);
  welcomeCard.appendChild(bgPattern);

  // Explicit Demo Data Banner
  const demoNotice = createElement('div', {
    className:
      'bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs',
  });
  demoNotice.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="p-1.5 bg-amber-200 text-amber-950 rounded-lg shrink-0">${getDashboardIcon('info', 'w-4 h-4')}</span>
      <span><strong>داده‌های آزمایشی (Demo Mode):</strong> کلیه آمار، اطلاعات دانش‌آموزان و فعالیت‌های نمایش داده شده جنبه نمونه داشته و صرفاً جهت بررسی پیش‌نمایش سامانه طراحی شده‌اند.</span>
    </div>
    <span class="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] shrink-0">آزمايشى</span>
  `;

  // 2. Summary KPI Cards Grid
  const statsGrid = createElement('div', {
    className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  });

  const card1 = createSummaryCard({
    title: 'کل دانش‌آموزان فعال',
    value: '۱,۴۵۰',
    iconName: 'users',
    changePercent: 12.5,
    changeType: 'increase',
    periodLabel: 'نسبت به ماه گذشته',
  });

  const card2 = createSummaryCard({
    title: 'کادر آموزشی و معلمان',
    value: '۶۸',
    iconName: 'teacher',
    changePercent: 3.2,
    changeType: 'increase',
    periodLabel: 'ترم جاری',
  });

  const card3 = createSummaryCard({
    title: 'کلاس‌ها و گروه‌ها',
    value: '۴۲',
    iconName: 'classes',
    changePercent: 0,
    changeType: 'neutral',
    periodLabel: 'درحال برگزاری',
  });

  const card4 = createSummaryCard({
    title: 'میانگین حضور و غیاب',
    value: '۹۶.۴٪',
    iconName: 'attendance',
    changePercent: 1.8,
    changeType: 'increase',
    periodLabel: 'هفته جاری',
  });

  statsGrid.appendChild(card1);
  statsGrid.appendChild(card2);
  statsGrid.appendChild(card3);
  statsGrid.appendChild(card4);

  // 3. Main Dashboard Body: Chart + Activity & Quick Actions Grid
  const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' });

  // Left/Center 2-cols: Attendance Breakdown Chart + Quick Actions
  const leftColumn = createElement('div', { className: 'lg:col-span-2 space-y-6' });

  // Attendance Visualization Card
  const chartCard = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4',
  });

  const chartHeader = createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-gray-100' });
  const chartTitleGroup = createElement('div', { className: 'flex items-center gap-2' });
  const chartIcon = createElement('div', {
    className: 'p-2 bg-[#ECE5F0] text-[#012622] rounded-lg',
    innerHTML: getDashboardIcon('chart', 'w-5 h-5'),
  });
  const chartTitle = createElement('h3', {
    className: 'text-sm font-bold text-gray-900',
    textContent: 'نمودار تفکیکی حضور و غیاب پایه‌های تحصیلی',
  });

  chartTitleGroup.appendChild(chartIcon);
  chartTitleGroup.appendChild(chartTitle);

  const chartBadge = createElement('span', {
    className: 'text-xs text-gray-500 font-medium',
    textContent: 'ارزیابی ۳۰ روز اخیر',
  });

  chartHeader.appendChild(chartTitleGroup);
  chartHeader.appendChild(chartBadge);

  // SVG / HTML Accessible Bar Chart
  const chartBody = createElement('div', { className: 'space-y-4 pt-2' });

  const gradeData = [
    { label: 'پایه دهم (ریاضی و تجربی)', percent: 96, count: '۴۸۰ دانش‌آموز', color: 'bg-[#012622]' },
    { label: 'پایه یازدهم (علوم پایه و انسانی)', percent: 94, count: '۴۵۰ دانش‌آموز', color: 'bg-[#003B36]' },
    { label: 'پایه دوازدهم (کنکور و فارغ‌التحصیلی)', percent: 98, count: '۵۲۰ دانش‌آموز', color: 'bg-[#E98A15]' },
  ];

  gradeData.forEach((item) => {
    const row = createElement('div', { className: 'space-y-1.5' });

    const rowHeader = createElement('div', { className: 'flex justify-between text-xs font-semibold text-gray-700' });
    const labelSpan = createElement('span', { textContent: item.label });
    const valSpan = createElement('span', {
      className: 'font-mono text-gray-900',
      textContent: `٪${item.percent} (${item.count})`,
    });

    rowHeader.appendChild(labelSpan);
    rowHeader.appendChild(valSpan);

    const track = createElement('div', { className: 'w-full bg-gray-100 h-3 rounded-full overflow-hidden flex' });
    const fill = createElement('div', {
      className: `h-full rounded-full transition-all duration-500 ${item.color}`,
      attributes: { style: `width: ${item.percent}%` },
    });

    track.appendChild(fill);
    row.appendChild(rowHeader);
    row.appendChild(track);

    chartBody.appendChild(row);
  });

  chartCard.appendChild(chartHeader);
  chartCard.appendChild(chartBody);

  // Quick Actions Section
  const actionsCard = createElement('div', { className: 'space-y-3' });
  const actionsHeader = createElement('h3', {
    className: 'text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2',
  });
  actionsHeader.innerHTML = `${getDashboardIcon('classes', 'w-4 h-4 text-[#012622]')} دسترسی سریع و بخش‌های عملیاتی`;

  const actionsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' });

  const act1 = createQuickAction({
    id: 'act-students',
    title: 'مدیریت دانش‌آموزان',
    description: 'مشاهده پرونده تحصیلی، ثبت‌نام جدید و دسترسی به سوابق',
    iconName: 'users',
    path: `/app/${membership.organizationId}/students`,
  });

  const act2 = createQuickAction({
    id: 'act-teachers',
    title: 'لیست معلمان و اساتید',
    description: 'بررسی برنامه تدریس، کلاس‌های انتسابی و ارتباط با همکاران',
    iconName: 'teacher',
    path: `/app/${membership.organizationId}/teachers`,
  });

  const act3 = createQuickAction({
    id: 'act-classes',
    title: 'برنامه‌ریزی کلاس‌ها',
    description: 'مدیریت زمان‌بندی دروس، تخصیص اتاق‌ها و ظرفیت گروه‌ها',
    iconName: 'classes',
    path: `/app/${membership.organizationId}/classes`,
  });

  const act4 = createQuickAction({
    id: 'act-attendance',
    title: 'گزارش‌های حضور و غیاب',
    description: 'پایش آنلاین غیبت‌های غیرمجاز و تأخیرهای روزانه',
    iconName: 'attendance',
    path: `/app/${membership.organizationId}/attendance`,
  });

  actionsGrid.appendChild(act1);
  actionsGrid.appendChild(act2);
  actionsGrid.appendChild(act3);
  actionsGrid.appendChild(act4);

  actionsCard.appendChild(actionsHeader);
  actionsCard.appendChild(actionsGrid);

  leftColumn.appendChild(chartCard);
  leftColumn.appendChild(actionsCard);

  // Right Column: Recent Activity Feed
  const rightColumn = createElement('div', { className: 'space-y-6' });

  const activityCard = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4',
  });

  const activityHeader = createElement('div', {
    className: 'flex items-center justify-between pb-3 border-b border-gray-100',
  });

  const actTitleGroup = createElement('div', { className: 'flex items-center gap-2' });
  const actIcon = createElement('div', {
    className: 'p-2 bg-[#ECE5F0] text-[#012622] rounded-lg',
    innerHTML: getDashboardIcon('announcement', 'w-5 h-5'),
  });
  const actTitle = createElement('h3', { className: 'text-sm font-bold text-gray-900', textContent: 'رویدادها و فعالیت‌های اخیر' });

  actTitleGroup.appendChild(actIcon);
  actTitleGroup.appendChild(actTitle);

  activityHeader.appendChild(actTitleGroup);

  const activityFeed = createActivityList(DEMO_RECENT_ACTIVITIES);

  activityCard.appendChild(activityHeader);
  activityCard.appendChild(activityFeed);

  rightColumn.appendChild(activityCard);

  mainGrid.appendChild(leftColumn);
  mainGrid.appendChild(rightColumn);

  container.appendChild(welcomeCard);
  container.appendChild(demoNotice);
  container.appendChild(statsGrid);
  container.appendChild(mainGrid);

  return container;
}
