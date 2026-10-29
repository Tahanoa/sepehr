/**
 * POLARIS ACTIVITY LIST COMPONENT
 * Renders recent events feed with status badges, timestamps, and actor context.
 */

import { createElement } from '../../utils/dom';
import { DemoActivity } from '../../data/demo-data';

export function createActivityList(activities: DemoActivity[]): HTMLElement {
  const container = createElement('div', { className: 'divide-y divide-gray-100/80 dark:divide-gray-800' });

  activities.forEach((act) => {
    const item = createElement('div', {
      className: 'py-3.5 px-2.5 hover:bg-gray-50/90 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 group',
    });

    const contentBox = createElement('div', { className: 'flex-1 min-w-0' });

    const headerRow = createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' });

    const badgeClass =
      act.badgeType === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80'
        : act.badgeType === 'primary'
        ? 'bg-[#ECE5F0] dark:bg-teal-950/50 text-[#012622] dark:text-teal-300 border border-[#012622]/10 dark:border-teal-800/80'
        : act.badgeType === 'warning'
        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/80'
        : 'bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80';

    const categoryBadge = createElement('span', {
      className: `px-2 py-0.5 rounded-md text-[11px] font-extrabold ${badgeClass}`,
      textContent: act.title,
    });

    const actor = createElement('span', {
      className: 'text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#012622] dark:group-hover:text-teal-400 transition-colors',
      textContent: act.actorName,
    });

    headerRow.appendChild(categoryBadge);
    headerRow.appendChild(actor);

    const desc = createElement('p', {
      className: 'text-xs text-gray-600 dark:text-gray-400 leading-relaxed truncate font-normal',
      textContent: act.description,
    });

    contentBox.appendChild(headerRow);
    contentBox.appendChild(desc);

    const time = createElement('span', {
      className: 'text-[11px] text-gray-400 dark:text-gray-500 shrink-0 font-semibold whitespace-nowrap pt-0.5',
      textContent: act.timestamp,
    });

    item.appendChild(contentBox);
    item.appendChild(time);

    container.appendChild(item);
  });

  return container;
}
