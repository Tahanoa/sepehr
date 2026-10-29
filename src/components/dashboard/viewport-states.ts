/**
 * POLARIS VIEWPORT STATES COMPONENTS
 * Reusable Loading, Empty, and Error state components for dashboard views.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';

export interface ViewportStateOptions {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function createLoadingState(message: string = 'در حال بارگذاری اطلاعات...'): HTMLElement {
  const container = createElement('div', {
    className: 'flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm text-center min-h-[280px]',
  });

  const spinner = createElement('div', {
    className: 'w-10 h-10 border-4 border-[#ECE5F0] dark:border-gray-700 border-t-[#012622] dark:border-t-teal-400 rounded-full animate-spin mb-4',
  });

  const text = createElement('p', {
    className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    textContent: message,
  });

  container.appendChild(spinner);
  container.appendChild(text);

  return container;
}

export function createErrorState(options: ViewportStateOptions): HTMLElement {
  const { title, description = 'خطایی در دریافت داده‌ها رخ داد. لطفاً دوباره تلاش کنید.', actionText = 'تلاش مجدد', onAction } = options;

  const container = createElement('div', {
    className: 'flex flex-col items-center justify-center p-8 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-sm text-center min-h-[260px]',
  });

  const icon = createElement('div', {
    className: 'p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full mb-3',
    innerHTML: getDashboardIcon('alert', 'w-8 h-8'),
  });

  const titleEl = createElement('h3', {
    className: 'text-base font-bold text-gray-900 dark:text-gray-100 mb-1',
    textContent: title,
  });

  const descEl = createElement('p', {
    className: 'text-xs text-gray-600 dark:text-gray-400 max-w-md mb-4 leading-relaxed',
    textContent: description,
  });

  container.appendChild(icon);
  container.appendChild(titleEl);
  container.appendChild(descEl);

  if (onAction) {
    const btn = createElement('button', {
      className: 'px-4 py-2 bg-[#012622] dark:bg-teal-700 text-white text-xs font-semibold rounded-lg hover:bg-[#003B36] dark:hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      textContent: actionText,
    });
    btn.addEventListener('click', onAction);
    container.appendChild(btn);
  }

  return container;
}
