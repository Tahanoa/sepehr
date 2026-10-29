/**
 * POLARIS ACTIVITY LIST COMPONENT
 * Renders recent events feed with status badges, timestamps, and actor context.
 */

import { createElement } from '../../utils/dom';
import { DemoActivity } from '../../data/demo-data';

export function createActivityList(activities: DemoActivity[]): HTMLElement {
  const container = createElement('div', { className: 'divide-y divide-gray-100/80' });

  activities.forEach((act) => {
    const item = createElement('div', {
      className: 'py-3.5 px-2.5 hover:bg-gray-50/90 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 group',
    });

    const contentBox = createElement('div', { className: 'flex-1 min-w-0' });

    const headerRow = createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' });

    const badgeClass =
      act.badgeType === 'success'
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
        : act.badgeType === 'primary'
        ? 'bg-[#ECE5F0] text-[#012622] border border-[#012622]/10'
        : act.badgeType === 'warning'
        ? 'bg-amber-50 text-amber-900 border border-amber-200/80'
        : 'bg-sky-50 text-sky-900 border border-sky-200/80';

    const categoryBadge = createElement('span', {
      className: `px-2 py-0.5 rounded-md text-[11px] font-extrabold ${badgeClass}`,
      textContent: act.title,
    });

    const actor = createElement('span', {
      className: 'text-xs font-bold text-gray-800 group-hover:text-[#012622] transition-colors',
      textContent: act.actorName,
    });

    headerRow.appendChild(categoryBadge);
    headerRow.appendChild(actor);

    const desc = createElement('p', {
      className: 'text-xs text-gray-600 leading-relaxed truncate font-normal',
      textContent: act.description,
    });

    contentBox.appendChild(headerRow);
    contentBox.appendChild(desc);

    const time = createElement('span', {
      className: 'text-[11px] text-gray-400 shrink-0 font-semibold whitespace-nowrap pt-0.5',
      textContent: act.timestamp,
    });

    item.appendChild(contentBox);
    item.appendChild(time);

    container.appendChild(item);
  });

  return container;
}
