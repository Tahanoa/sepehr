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
      'bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group h-full',
  });

  // Top Row: Title & Icon
  const topRow = createElement('div', { className: 'flex items-center justify-between gap-2 mb-3' });

  const titleEl = createElement('span', {
    className: 'text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors',
    textContent: title,
  });

  const iconBox = createElement('div', {
    className:
      'p-2.5 rounded-lg bg-[#ECE5F0]/60 text-[#012622] group-hover:bg-[#012622] group-hover:text-white transition-all duration-200 shrink-0',
    innerHTML: getDashboardIcon(iconName, 'w-5 h-5'),
  });

  topRow.appendChild(titleEl);
  topRow.appendChild(iconBox);

  // Middle Row: Big Metric Value
  const valueEl = createElement('div', {
    className: 'text-2xl sm:text-3xl font-extrabold text-[#012622] tracking-tight mb-2 dir-rtl text-right',
    textContent: String(value),
  });

  // Bottom Row: Trend Badge & Period
  const bottomRow = createElement('div', { className: 'flex items-center justify-between text-xs pt-2 border-t border-gray-100' });

  if (changePercent !== undefined) {
    const isUp = changeType === 'increase';
    const isDown = changeType === 'decrease';

    let badgeBg = 'bg-gray-100 text-gray-700';
    let arrow = '•';

    if (isUp) {
      badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      arrow = '↑';
    } else if (isDown) {
      badgeBg = 'bg-amber-50 text-amber-800 border border-amber-200';
      arrow = '↓';
    }

    const badge = createElement('span', {
      className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeBg}`,
      textContent: `${arrow} ${changePercent}٪`,
    });
    bottomRow.appendChild(badge);
  }

  if (periodLabel) {
    const period = createElement('span', {
      className: 'text-gray-400 text-[11px] truncate',
      textContent: periodLabel,
    });
    bottomRow.appendChild(period);
  }

  card.appendChild(topRow);
  card.appendChild(valueEl);
  card.appendChild(bottomRow);

  return card;
}
