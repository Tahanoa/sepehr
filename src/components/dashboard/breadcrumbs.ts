/**
 * POLARIS BREADCRUMBS COMPONENT
 * Accessible breadcrumb navigation trail.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

export function createBreadcrumbs(items: BreadcrumbItem[]): HTMLElement {
  const nav = createElement('nav', {
    className: 'flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1',
    attributes: { 'aria-label': 'مسیر صفحه' },
  });

  const list = createElement('ol', { className: 'flex items-center space-x-2 space-x-reverse flex-wrap' });

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const li = createElement('li', { className: 'flex items-center' });

    if (index > 0) {
      const separator = createElement('span', {
        className: 'mx-1.5 text-gray-400 dark:text-gray-600 flex items-center',
        innerHTML: getDashboardIcon('chevron-left', 'w-3.5 h-3.5 rtl:rotate-180'),
      });
      li.appendChild(separator);
    }

    if (isLast || !item.path) {
      const current = createElement('span', {
        className: 'text-emerald-950 dark:text-teal-300 font-semibold truncate max-w-[200px]',
        textContent: item.title,
        attributes: { 'aria-current': 'page' },
      });
      li.appendChild(current);
    } else {
      const link = createElement('a', {
        className: 'text-gray-600 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-teal-400 transition-colors duration-150',
        textContent: item.title,
        attributes: { href: item.path },
      });
      const targetPath = item.path;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: targetPath }));
      });
      li.appendChild(link);
    }

    list.appendChild(li);
  });

  nav.appendChild(list);
  return nav;
}
