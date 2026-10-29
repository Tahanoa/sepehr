/**
 * POLARIS SKELETON LOADING COMPONENTS
 * Reusable, accessible skeleton loading placeholders matching Polaris layout shapes.
 */

import { createElement } from '../utils/dom';

export interface SkeletonOptions {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

/** Base Skeleton Element with Shimmer Animation */
export function createSkeleton(options: SkeletonOptions = {}): HTMLElement {
  const { className = '', width, height, borderRadius = '0.75rem' } = options;

  const styleParts: string[] = [];
  if (width) styleParts.push(`width: ${width}`);
  if (height) styleParts.push(`height: ${height}`);
  if (borderRadius) styleParts.push(`border-radius: ${borderRadius}`);

  return createElement('div', {
    className: `animate-polaris-shimmer bg-gray-200/80 dark:bg-gray-700/50 ${className}`.trim(),
    attributes: {
      style: styleParts.join('; '),
      'aria-hidden': 'true',
    },
  });
}

/** Placeholder for Single or Multi-line Text Block */
export function createSkeletonText(lines: number = 1, options: SkeletonOptions = {}): HTMLElement {
  const container = createElement('div', { className: 'space-y-2 w-full' });

  for (let i = 0; i < lines; i++) {
    const isLast = i === lines - 1 && lines > 1;
    const line = createSkeleton({
      height: '0.875rem',
      width: isLast ? '65%' : '100%',
      borderRadius: '0.375rem',
      ...options,
    });
    container.appendChild(line);
  }

  return container;
}

/** Circular Avatar Placeholder */
export function createSkeletonAvatar(size: 'sm' | 'md' | 'lg' = 'md'): HTMLElement {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return createSkeleton({
    className: `${sizeMap[size]} shrink-0`,
    borderRadius: '9999px',
  });
}

/** Single KPI Summary Card Skeleton */
export function createSkeletonCard(): HTMLElement {
  const card = createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs space-y-4 dir-rtl h-full',
  });

  // Top row: Title + Icon
  const topRow = createElement('div', { className: 'flex items-center justify-between' });
  const titleSk = createSkeleton({ width: '60%', height: '1rem', borderRadius: '0.375rem' });
  const iconSk = createSkeleton({ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem' });
  topRow.appendChild(titleSk);
  topRow.appendChild(iconSk);

  // Big Metric
  const metricSk = createSkeleton({ width: '45%', height: '2.25rem', borderRadius: '0.5rem' });

  // Bottom row: Trend badge + Period
  const bottomRow = createElement('div', { className: 'flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700' });
  const badgeSk = createSkeleton({ width: '30%', height: '1.25rem', borderRadius: '9999px' });
  const periodSk = createSkeleton({ width: '35%', height: '0.875rem', borderRadius: '0.375rem' });
  bottomRow.appendChild(badgeSk);
  bottomRow.appendChild(periodSk);

  card.appendChild(topRow);
  card.appendChild(metricSk);
  card.appendChild(bottomRow);

  return card;
}

/** Attendance / Performance Chart Skeleton */
export function createSkeletonChart(): HTMLElement {
  const card = createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs space-y-5 dir-rtl',
  });

  const header = createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700' });
  const titleGroup = createElement('div', { className: 'flex items-center gap-3 w-2/3' });
  const iconSk = createSkeleton({ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem' });
  const titleSk = createSkeletonText(1, { height: '1rem' });
  titleGroup.appendChild(iconSk);
  titleGroup.appendChild(titleSk);

  const badgeSk = createSkeleton({ width: '20%', height: '1rem', borderRadius: '0.375rem' });
  header.appendChild(titleGroup);
  header.appendChild(badgeSk);

  const barsContainer = createElement('div', { className: 'space-y-4 pt-1' });
  for (let i = 0; i < 3; i++) {
    const row = createElement('div', { className: 'space-y-2' });
    const rowHeader = createElement('div', { className: 'flex justify-between' });
    const labelSk = createSkeleton({ width: '35%', height: '0.875rem' });
    const valSk = createSkeleton({ width: '20%', height: '0.875rem' });
    rowHeader.appendChild(labelSk);
    rowHeader.appendChild(valSk);

    const barTrack = createSkeleton({ width: '100%', height: '0.75rem', borderRadius: '9999px' });
    row.appendChild(rowHeader);
    row.appendChild(barTrack);
    barsContainer.appendChild(row);
  }

  card.appendChild(header);
  card.appendChild(barsContainer);

  return card;
}

/** Activity List Feed Skeleton */
export function createSkeletonActivityList(count: number = 4): HTMLElement {
  const container = createElement('div', { className: 'space-y-4 dir-rtl' });

  for (let i = 0; i < count; i++) {
    const item = createElement('div', { className: 'flex items-start justify-between gap-3 p-2' });
    const leftGroup = createElement('div', { className: 'flex-1 space-y-2' });
    const topBadge = createSkeleton({ width: '40%', height: '1rem', borderRadius: '0.375rem' });
    const descText = createSkeleton({ width: '85%', height: '0.875rem', borderRadius: '0.25rem' });

    leftGroup.appendChild(topBadge);
    leftGroup.appendChild(descText);

    const timeSk = createSkeleton({ width: '15%', height: '0.75rem', borderRadius: '0.25rem' });

    item.appendChild(leftGroup);
    item.appendChild(timeSk);
    container.appendChild(item);
  }

  return container;
}

/** Full Dashboard Skeleton Page Layout */
export function createDashboardSkeleton(): HTMLElement {
  const container = createElement('div', {
    className: 'space-y-6 dir-rtl animate-fade-in',
    attributes: {
      role: 'status',
      'aria-live': 'polite',
      'aria-label': 'درحال بارگذاری اطلاعات پیش‌خوان...',
    },
  });

  // Screen reader accessible loading text
  const srOnlyText = createElement('span', {
    className: 'sr-only',
    textContent: 'درحال بارگذاری اطلاعات پیش‌خوان، لطفاً شکیبا باشید.',
  });
  container.appendChild(srOnlyText);

  // Welcome Header Banner Skeleton
  const headerBanner = createElement('div', {
    className: 'bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-6 shadow-xs space-y-3',
  });
  headerBanner.appendChild(createSkeleton({ width: '120px', height: '1.25rem', borderRadius: '9999px' }));
  headerBanner.appendChild(createSkeleton({ width: '45%', height: '1.75rem', borderRadius: '0.5rem' }));
  headerBanner.appendChild(createSkeleton({ width: '80%', height: '1rem', borderRadius: '0.375rem' }));
  container.appendChild(headerBanner);

  // 4 KPI Summary Cards Grid Skeleton
  const kpiGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' });
  for (let i = 0; i < 4; i++) {
    kpiGrid.appendChild(createSkeletonCard());
  }
  container.appendChild(kpiGrid);

  // Main 2-Column Grid Skeleton (Chart + Quick Actions & Activity Feed)
  const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' });

  const leftCol = createElement('div', { className: 'lg:col-span-2 space-y-6' });
  leftCol.appendChild(createSkeletonChart());

  // Quick action grid skeleton
  const quickActionGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' });
  for (let i = 0; i < 4; i++) {
    const actCard = createElement('div', {
      className: 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-4 shadow-xs flex items-center gap-3.5',
    });
    const actIcon = createSkeleton({ width: '2.75rem', height: '2.75rem', borderRadius: '0.5rem' });
    const actText = createSkeletonText(2);
    actCard.appendChild(actIcon);
    actCard.appendChild(actText);
    quickActionGrid.appendChild(actCard);
  }
  leftCol.appendChild(quickActionGrid);

  const rightCol = createElement('div', { className: 'space-y-6' });
  const activityCard = createElement('div', {
    className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-xs space-y-4',
  });
  activityCard.appendChild(createSkeleton({ width: '50%', height: '1.25rem' }));
  activityCard.appendChild(createSkeletonActivityList(4));
  rightCol.appendChild(activityCard);

  mainGrid.appendChild(leftCol);
  mainGrid.appendChild(rightCol);

  container.appendChild(mainGrid);

  return container;
}
