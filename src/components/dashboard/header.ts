/**
 * POLARIS DASHBOARD HEADER COMPONENT
 * Top header containing mobile menu toggle, search bar, notification button,
 * user avatar & menu, and dev-only demo switcher trigger.
 */

import { createElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { getDashboardIcon } from './icons';
import { createUserMenu, createNotificationButton } from './user-menu';

export interface DashboardHeaderOptions {
  user: User;
  membership: OrganizationMembership;
  pageTitle: string;
  onMobileToggle: () => void;
  onOpenDemoModal?: () => void;
}

export function createDashboardHeader(options: DashboardHeaderOptions): HTMLElement {
  const { user, membership, pageTitle, onMobileToggle, onOpenDemoModal } = options;

  const header = createElement('header', {
    className:
      'bg-white border-b border-gray-200/80 sticky top-0 z-20 px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4 dir-rtl shadow-sm',
  });

  // Right Side: Mobile Drawer Toggle & Page Context
  const rightGroup = createElement('div', { className: 'flex items-center gap-3 min-w-0' });

  const mobileToggle = createElement('button', {
    className:
      'p-2 rounded-xl text-gray-700 hover:bg-gray-100 lg:hidden transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    attributes: { 'aria-label': 'باز کردن منو', 'aria-expanded': 'false' },
    innerHTML: getDashboardIcon('menu', 'w-6 h-6'),
  });
  mobileToggle.addEventListener('click', onMobileToggle);

  const titleGroup = createElement('div', { className: 'min-w-0' });
  const h1 = createElement('h1', {
    className: 'text-base sm:text-lg font-extrabold text-[#012622] truncate tracking-tight',
    textContent: pageTitle,
  });

  titleGroup.appendChild(h1);

  rightGroup.appendChild(mobileToggle);
  rightGroup.appendChild(titleGroup);

  // Center/Left Actions: Search Bar & Notifications & User Controls
  const leftGroup = createElement('div', { className: 'flex items-center gap-2 sm:gap-3 shrink-0' });

  // Search Control (functional placeholder search)
  const searchContainer = createElement('div', { className: 'hidden md:flex items-center relative w-48 lg:w-64' });
  const searchInput = createElement('input', {
    className:
      'w-full bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#012622] focus:ring-2 focus:ring-[#012622]/20 transition-all',
    attributes: { type: 'text', placeholder: 'جستجو در سیستم...' },
  });
  const searchIcon = createElement('span', {
    className: 'absolute start-2.5 text-gray-400 pointer-events-none',
    innerHTML: getDashboardIcon('search', 'w-4 h-4'),
  });

  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);

  // Dev Demo Switcher Quick Button
  if (import.meta.env.DEV && onOpenDemoModal) {
    const demoQuickBtn = createElement('button', {
      className:
        'inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      attributes: { title: 'تغییر نقش آزمایشی دمو' },
    });
    demoQuickBtn.innerHTML = `${getDashboardIcon('swap', 'w-4 h-4 text-amber-800')} <span class="hidden md:inline">نقش دمو</span>`;
    demoQuickBtn.addEventListener('click', onOpenDemoModal);
    leftGroup.appendChild(demoQuickBtn);
  }

  // Notification Control
  const notifBtn = createNotificationButton();
  leftGroup.appendChild(notifBtn);

  // User Menu Dropdown
  const userMenu = createUserMenu({ user, membership, onOpenDemoModal });
  leftGroup.appendChild(userMenu);

  header.appendChild(rightGroup);
  header.appendChild(leftGroup);

  return header;
}
