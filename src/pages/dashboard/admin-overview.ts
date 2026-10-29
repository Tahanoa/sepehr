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
import { createDashboardSkeleton } from '../../components/skeleton';

export function createAdminOverviewPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });

  let isLoadingState = false;

  const renderContent = () => {
    rootWrapper.innerHTML = '';

    if (isLoadingState) {
      const skHeader = createElement('div', { className: 'flex items-center justify-between mb-4' });
      const toggleBtn = createElement('button', {
        className:
          'px-3.5 py-2 bg-[rgb(var(--theme-primary))] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[rgb(var(--theme-hover))] transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
        innerHTML: `${getDashboardIcon('swap', 'w-4 h-4 text-amber-400')} خروج از حالت بارگذاری (نمایش داده‌ها)`,
      });
      toggleBtn.addEventListener('click', () => {
        isLoadingState = false;
        renderContent();
      });
      skHeader.appendChild(toggleBtn);
      rootWrapper.appendChild(skHeader);
      rootWrapper.appendChild(createDashboardSkeleton());
      return;
    }

    // 1. Welcome & Demo Banner Header
    const welcomeCard = createElement('div', {
      className:
        'bg-gradient-to-br from-[rgb(var(--theme-primary))] via-[rgb(var(--theme-hover))] to-[rgb(var(--theme-secondary))] rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden',
    });

    const welcomeContent = createElement('div', { className: 'relative z-10 space-y-2.5 max-w-2xl' });

    const badgeGroup = createElement('div', { className: 'flex items-center gap-2 flex-wrap' });

    const badge = createElement('div', {
      className:
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] shadow-2xs',
      textContent: 'پنل مدیریت ارشد مرکز',
    });

    const skeletonToggleBtn = createElement('button', {
      className:
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      innerHTML: `${getDashboardIcon('chart', 'w-3.5 h-3.5')} پیش‌نمایش حالت بارگذاری (Skeleton)`,
    });
    skeletonToggleBtn.addEventListener('click', () => {
      isLoadingState = true;
      renderContent();
    });

    badgeGroup.appendChild(badge);
    badgeGroup.appendChild(skeletonToggleBtn);

    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight',
      textContent: `خوش آمدید، ${membership.organization.name}`,
    });

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-200 leading-relaxed font-normal opacity-90 max-w-xl',
      textContent:
        'نگاه کلی به وضعیت آموزشی، آمار شاخص‌های کلیدی عملکرد، حضور و غیاب مرکز و فعالیت‌های اخیر در یک نگاه.',
    });

    welcomeContent.appendChild(badgeGroup);
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
        'bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs',
    });
    demoNotice.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="p-2 bg-amber-200/80 text-amber-950 rounded-xl shrink-0 shadow-2xs">${getDashboardIcon('info', 'w-4 h-4')}</span>
        <span class="leading-relaxed truncate sm:whitespace-normal"><strong>داده‌های آزمایشی (Demo Mode):</strong> کلیه آمار، اطلاعات دانش‌آموزان و فعالیت‌های نمایش داده شده جنبه نمونه داشته و جهت بررسی سامانه است.</span>
      </div>
      <span class="px-2.5 py-1 bg-amber-200/90 text-amber-950 rounded-lg font-bold text-[10px] shrink-0">آزمایشی</span>
    `;

    // 2. Summary KPI Cards Grid
    const statsGrid = createElement('div', {
      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5',
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
      className: 'bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4',
    });

    const chartHeader = createElement('div', { className: 'flex items-center justify-between pb-3.5 border-b border-gray-100 flex-wrap gap-2' });
    const chartTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
    const chartIcon = createElement('div', {
      className: 'p-2.5 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0 shadow-2xs',
      innerHTML: getDashboardIcon('chart', 'w-5 h-5'),
    });
    const chartTitle = createElement('h3', {
      className: 'text-xs sm:text-sm font-bold text-gray-900 tracking-tight',
      textContent: 'نمودار تفکیکی حضور و غیاب پایه‌های تحصیلی',
    });

    chartTitleGroup.appendChild(chartIcon);
    chartTitleGroup.appendChild(chartTitle);

    const chartBadge = createElement('span', {
      className: 'px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold shrink-0',
      textContent: 'ارزیابی ۳۰ روز اخیر',
    });

    chartHeader.appendChild(chartTitleGroup);
    chartHeader.appendChild(chartBadge);

    // SVG / HTML Accessible Bar Chart
    const chartBody = createElement('div', { className: 'space-y-4 pt-2' });

    const gradeData = [
      { label: 'پایه دهم (ریاضی و تجربی)', percent: 96, count: '۴۸۰ دانش‌آموز', color: 'bg-[rgb(var(--theme-primary))]' },
      { label: 'پایه یازدهم (علوم پایه و انسانی)', percent: 94, count: '۴۵۰ دانش‌آموز', color: 'bg-[rgb(var(--theme-hover))]' },
      { label: 'پایه دوازدهم (کنکور و فارغ‌التحصیلی)', percent: 98, count: '۵۲۰ دانش‌آموز', color: 'bg-[rgb(var(--theme-accent))]' },
    ];

    gradeData.forEach((item) => {
      const row = createElement('div', { className: 'space-y-1.5' });

      const rowHeader = createElement('div', { className: 'flex justify-between text-xs font-bold text-gray-700' });
      const labelSpan = createElement('span', { textContent: item.label });
      const valSpan = createElement('span', {
        className: 'font-mono text-[rgb(var(--theme-primary))] font-bold',
        textContent: `٪${item.percent} (${item.count})`,
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

    chartCard.appendChild(chartHeader);
    chartCard.appendChild(chartBody);

    // Quick Actions Section
    const actionsCard = createElement('div', { className: 'space-y-3.5' });
    const actionsHeader = createElement('h3', {
      className: 'text-xs sm:text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2',
    });
    actionsHeader.innerHTML = `${getDashboardIcon('classes', 'w-4 h-4 text-[rgb(var(--theme-primary))]')} دسترسی سریع و بخش‌های عملیاتی`;

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
      className: 'bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4',
    });

    const activityHeader = createElement('div', {
      className: 'flex items-center justify-between pb-3.5 border-b border-gray-100',
    });

    const actTitleGroup = createElement('div', { className: 'flex items-center gap-2.5' });
    const actIcon = createElement('div', {
      className: 'p-2.5 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-xl shrink-0 shadow-2xs',
      innerHTML: getDashboardIcon('announcement', 'w-5 h-5'),
    });
    const actTitle = createElement('h3', { className: 'text-xs sm:text-sm font-bold text-gray-900 tracking-tight', textContent: 'رویدادها و فعالیت‌های اخیر' });

    actTitleGroup.appendChild(actIcon);
    actTitleGroup.appendChild(actTitle);

    activityHeader.appendChild(actTitleGroup);

    const activityFeed = createActivityList(DEMO_RECENT_ACTIVITIES);

    activityCard.appendChild(activityHeader);
    activityCard.appendChild(activityFeed);

    rightColumn.appendChild(activityCard);

    mainGrid.appendChild(leftColumn);
    mainGrid.appendChild(rightColumn);

    rootWrapper.appendChild(welcomeCard);
    rootWrapper.appendChild(demoNotice);
    rootWrapper.appendChild(statsGrid);
    rootWrapper.appendChild(mainGrid);
  };

  renderContent();
  return rootWrapper;
}
