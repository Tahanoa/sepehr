/**
 * POLARIS STATISTIC CARD COMPONENT
 * Renders executive KPI metrics with icon, title, trend badge, and description.
 */

import { StatMetric } from '../types/common';
import { createElement } from '../utils/dom';

export function createStatCard(metric: StatMetric): HTMLElement {
  const card = createElement('div', { className: 'polaris-card polaris-stat-card' });

  // Header: Title & Icon
  const header = createElement('div', { className: 'polaris-stat-header' });
  const title = createElement('span', { className: 'polaris-stat-title', textContent: metric.title });

  const iconWrapper = createElement('div', { className: 'polaris-stat-icon-wrapper' });
  iconWrapper.innerHTML = getMetricIcon(metric.iconName);

  header.appendChild(title);
  header.appendChild(iconWrapper);

  // Body: Big Numeric Value
  const value = createElement('div', { className: 'polaris-stat-value', textContent: String(metric.value) });

  // Footer: Trend & Period
  const footer = createElement('div', { className: 'polaris-stat-footer' });

  if (metric.changePercent !== undefined) {
    const isUp = metric.changeType === 'increase';
    const trendClass = isUp ? 'polaris-stat-trend--up' : 'polaris-stat-trend--down';
    const arrow = isUp ? '↑' : '↓';

    const trend = createElement('span', {
      className: `polaris-stat-trend ${trendClass}`,
      textContent: `${arrow} ${metric.changePercent}٪`,
    });
    footer.appendChild(trend);
  }

  if (metric.periodLabel) {
    const period = createElement('span', { className: 'polaris-stat-desc', textContent: metric.periodLabel });
    footer.appendChild(period);
  }

  card.appendChild(header);
  card.appendChild(value);
  card.appendChild(footer);

  return card;
}

function getMetricIcon(iconName?: string): string {
  switch (iconName) {
    case 'users':
      return `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    case 'book':
      return `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    case 'award':
      return `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`;
    case 'alert':
    default:
      return `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  }
}
