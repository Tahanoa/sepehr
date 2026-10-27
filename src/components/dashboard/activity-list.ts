/**
 * POLARIS ACTIVITY LIST COMPONENT
 * Renders recent events feed with status badges, timestamps, and actor context.
 */

import { createElement } from '../../utils/dom';
import { DemoActivity } from '../../data/demo-data';

export function createActivityList(activities: DemoActivity[]): HTMLElement {
  const container = createElement('div', { className: 'divide-y divide-gray-100' });

  activities.forEach((act) => {
    const item = createElement('div', {
      className: 'py-3.5 px-2 hover:bg-gray-50/80 rounded-lg transition-colors flex items-start justify-between gap-3',
    });

    const contentBox = createElement('div', { className: 'flex-1 min-w-0' });

    const headerRow = createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' });

    const badgeClass =
      act.badgeType === 'success'
        ? 'bg-emerald-100 text-emerald-800'
        : act.badgeType === 'primary'
        ? 'bg-[#ECE5F0] text-[#012622]'
        : act.badgeType === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-blue-100 text-blue-800';

    const categoryBadge = createElement('span', {
      className: `px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass}`,
      textContent: act.title,
    });

    const actor = createElement('span', {
      className: 'text-xs font-semibold text-gray-700',
      textContent: act.actorName,
    });

    headerRow.appendChild(categoryBadge);
    headerRow.appendChild(actor);

    const desc = createElement('p', {
      className: 'text-xs text-gray-600 leading-relaxed truncate',
      textContent: act.description,
    });

    contentBox.appendChild(headerRow);
    contentBox.appendChild(desc);

    const time = createElement('span', {
      className: 'text-[11px] text-gray-400 shrink-0 font-medium whitespace-nowrap',
      textContent: act.timestamp,
    });

    item.appendChild(contentBox);
    item.appendChild(time);

    container.appendChild(item);
  });

  return container;
}
