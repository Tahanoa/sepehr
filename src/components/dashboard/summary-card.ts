/**
 * POLARIS SUMMARY CARD COMPONENT
 * Renders executive KPI metrics with icon, value, change indicator, and period label.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';

export interface SummaryCardOptions {
  title: string;
  value: string | number;
  iconName: string;
  changePercent?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  periodLabel?: string;
  accentColor?: 'evergreen' | 'amber' | 'purple' | 'dark-green';
}

export function createSummaryCard(options: SummaryCardOptions): HTMLElement {
  const { title, value, iconName, changePercent, changeType = 'neutral', periodLabel } = options;

  const card = createElement('div', {
    className:
      'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md hover:border-[rgb(var(--theme-primary))]/30 transition-all duration-200 flex flex-col justify-between group h-full relative overflow-hidden',
  });

  // Subtle top accent border line on hover
  const topAccent = createElement('div', {
    className: 'absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-[rgb(var(--theme-accent))] transition-all duration-300',
  });

  // Top Row: Title & Icon
  const topRow = createElement('div', { className: 'flex items-center justify-between gap-2 mb-2' });

  const titleEl = createElement('span', {
    className: 'text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors truncate',
    textContent: title,
  });

  const iconBox = createElement('div', {
    className:
      'p-2.5 rounded-xl bg-[rgb(var(--theme-subtle))]/70 text-[rgb(var(--theme-primary))] group-hover:bg-[rgb(var(--theme-primary))] group-hover:text-white transition-all duration-200 shrink-0 shadow-2xs',
    innerHTML: getDashboardIcon(iconName, 'w-5 h-5'),
  });

  topRow.appendChild(titleEl);
  topRow.appendChild(iconBox);

  // Middle Row: Big Metric Value
  const valueEl = createElement('div', {
    className: 'text-2xl sm:text-3xl font-bold text-[rgb(var(--theme-primary))] tracking-tight my-1.5 dir-rtl text-right',
    textContent: String(value),
  });

  // Bottom Row: Trend Badge & Period
  const bottomRow = createElement('div', { className: 'flex items-center justify-between text-xs pt-2.5 border-t border-gray-100 gap-2' });

  if (changePercent !== undefined) {
    const isUp = changeType === 'increase';
    const isDown = changeType === 'decrease';

    let badgeBg = 'bg-gray-100 text-gray-700';
    let arrow = '•';

    if (isUp) {
      badgeBg = 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
      arrow = '↑';
    } else if (isDown) {
      badgeBg = 'bg-amber-50 text-amber-900 border border-amber-200/80';
      arrow = '↓';
    }

    const badge = createElement('span', {
      className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeBg}`,
      textContent: `${arrow} ${changePercent}٪`,
    });
    bottomRow.appendChild(badge);
  }

  if (periodLabel) {
    const period = createElement('span', {
      className: 'text-gray-400 text-[11px] truncate font-medium',
      textContent: periodLabel,
    });
    bottomRow.appendChild(period);
  }

  card.appendChild(topAccent);
  card.appendChild(topRow);
  card.appendChild(valueEl);
  card.appendChild(bottomRow);

  return card;
}
