/**
 * POLARIS QUICK ACTION COMPONENT
 * Interactive action cards with icon, label, and description for rapid navigation.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  path: string;
  badge?: string;
}

export function createQuickAction(item: QuickActionItem): HTMLElement {
  const card = createElement('a', {
    className:
      'group relative bg-white border border-gray-200/80 hover:border-[#012622] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-[#E98A15] h-full',
    attributes: { href: item.path },
  });

  card.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: item.path }));
  });

  const iconContainer = createElement('div', {
    className:
      'p-3 rounded-lg bg-[#ECE5F0]/70 text-[#012622] group-hover:bg-[#012622] group-hover:text-white transition-all duration-200 shrink-0',
    innerHTML: getDashboardIcon(item.iconName, 'w-5 h-5'),
  });

  const textContent = createElement('div', { className: 'flex-1 min-w-0' });

  const titleRow = createElement('div', { className: 'flex items-center justify-between gap-1 mb-1' });
  const title = createElement('h4', {
    className: 'text-sm font-bold text-gray-900 group-hover:text-[#012622] transition-colors truncate',
    textContent: item.title,
  });

  const arrow = createElement('span', {
    className: 'text-gray-400 group-hover:text-[#E98A15] group-hover:-translate-x-1 transition-all duration-200 shrink-0',
    innerHTML: getDashboardIcon('chevron-left', 'w-4 h-4 rtl:rotate-180'),
  });

  titleRow.appendChild(title);
  titleRow.appendChild(arrow);

  const desc = createElement('p', {
    className: 'text-xs text-gray-500 line-clamp-2 leading-relaxed',
    textContent: item.description,
  });

  textContent.appendChild(titleRow);
  textContent.appendChild(desc);

  card.appendChild(iconContainer);
  card.appendChild(textContent);

  return card;
}
