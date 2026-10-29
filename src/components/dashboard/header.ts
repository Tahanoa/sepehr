import { openCommandMenu } from '../command-menu';
import { openThemePanel } from '../../theme/theme-panel';
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
      'product-header bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 px-3.5 sm:px-6 h-[68px] flex items-center justify-between gap-3 dir-rtl shadow-2xs transition-all duration-200',
  });

  // Right Side: Mobile Drawer Toggle & Page Context
  const rightGroup = createElement('div', { className: 'flex items-center gap-2.5 sm:gap-3 min-w-0' });

  const mobileToggle = createElement('button', {
    className:
      'p-2.5 rounded-xl text-gray-700 hover:bg-gray-100/90 lg:hidden transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center',
    attributes: { 'aria-label': 'باز کردن منوی اصلی', 'aria-expanded': 'false' },
    innerHTML: getDashboardIcon('menu', 'w-5 h-5'),
  });
  mobileToggle.addEventListener('click', onMobileToggle);

  const titleGroup = createElement('div', { className: 'min-w-0 flex flex-col justify-center' });
  const h1 = createElement('h1', {
    className: 'text-sm sm:text-base lg:text-lg font-bold text-[rgb(var(--theme-primary))] truncate tracking-tight',
    textContent: pageTitle,
  });

  titleGroup.appendChild(h1);

  rightGroup.appendChild(mobileToggle);
  rightGroup.appendChild(titleGroup);

  // Center/Left Actions: Search Bar & Notifications & User Controls
  const leftGroup = createElement('div', { className: 'flex items-center gap-2 sm:gap-3 shrink-0' });

  const search = createElement('button', { className: 'shell-search', textContent: 'جستجو در سپهر  ⌘ K', attributes: { type: 'button', 'aria-label': 'جستجو در سپهر' } });
  search.addEventListener('click', openCommandMenu); leftGroup.append(search);
  const appearance = createElement('button', {
    className: 'sepehr-secondary min-h-[44px]',
    attributes: { type: 'button', 'aria-label': 'تنظیم رنگ و ظاهر سپهر' },
    textContent: 'ظاهر',
  });
  appearance.addEventListener('click', openThemePanel);
  leftGroup.appendChild(appearance);

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

