/**
 * POLARIS DASHBOARD HEADER COMPONENT
 * Top header containing mobile menu toggle, search bar, notification button, theme switcher,
 * user avatar & menu, and dev-only demo switcher trigger.
 */

import { createElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { getDashboardIcon } from './icons';
import { createUserMenu, createNotificationButton } from './user-menu';
import { themeService, ThemeMode } from '../../services/theme-service';

export interface DashboardHeaderOptions {
  user: User;
  membership: OrganizationMembership;
  pageTitle: string;
  onMobileToggle: () => void;
  onOpenDemoModal?: () => void;
}

export function createThemeSelectorButton(): HTMLElement {
  const container = createElement('div', { className: 'relative' });

  const btn = createElement('button', {
    className:
      'p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15] min-w-[40px] min-h-[40px] flex items-center justify-center',
    attributes: { 'aria-label': 'تغییر پوسته (تم)', 'aria-expanded': 'false' },
  });

  const updateIcon = () => {
    const mode = themeService.getMode();
    const resolved = themeService.getResolvedTheme();
    let iconName = 'desktop';
    if (mode === 'light') iconName = 'sun';
    else if (mode === 'dark') iconName = 'moon';
    else iconName = resolved === 'dark' ? 'moon' : 'sun';

    btn.innerHTML = getDashboardIcon(iconName, 'w-5 h-5');
  };

  updateIcon();
  themeService.subscribe(updateIcon);

  // Dropdown menu
  const menu = createElement('div', {
    className:
      'hidden absolute end-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1.5 text-xs text-right dir-rtl animate-pop-in',
  });

  const options: Array<{ mode: ThemeMode; label: string; icon: string }> = [
    { mode: 'light', label: 'روشن (روز)', icon: 'sun' },
    { mode: 'dark', label: 'تاریک (شب)', icon: 'moon' },
    { mode: 'system', label: 'هماهنگ با سیستم', icon: 'desktop' },
  ];

  options.forEach((opt) => {
    const item = createElement('button', {
      className:
        'w-full text-right px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 font-medium flex items-center justify-between transition-colors',
    });

    const activeMode = themeService.getMode();
    const isSelected = activeMode === opt.mode;

    const labelGroup = createElement('div', { className: 'flex items-center gap-2' });
    labelGroup.innerHTML = `${getDashboardIcon(opt.icon, 'w-4 h-4 text-amber-500 dark:text-amber-400')} <span>${opt.label}</span>`;

    item.appendChild(labelGroup);

    if (isSelected) {
      const checkMark = createElement('span', {
        className: 'w-2 h-2 rounded-full bg-[#E98A15]',
      });
      item.appendChild(checkMark);
    }

    item.addEventListener('click', () => {
      themeService.setMode(opt.mode);
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });

    menu.appendChild(item);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  container.appendChild(btn);
  container.appendChild(menu);

  return container;
}

export function createDashboardHeader(options: DashboardHeaderOptions): HTMLElement {
  const { user, membership, pageTitle, onMobileToggle, onOpenDemoModal } = options;

  const header = createElement('header', {
    className:
      'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 sticky top-0 z-20 px-3.5 sm:px-6 h-[68px] flex items-center justify-between gap-3 dir-rtl shadow-2xs transition-all duration-200',
  });

  // Right Side: Mobile Drawer Toggle & Page Context
  const rightGroup = createElement('div', { className: 'flex items-center gap-2.5 sm:gap-3 min-w-0' });

  const mobileToggle = createElement('button', {
    className:
      'p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100/90 dark:hover:bg-gray-800 lg:hidden transition-all focus:outline-none focus:ring-2 focus:ring-[#E98A15] shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center',
    attributes: { 'aria-label': 'باز کردن منوی اصلی', 'aria-expanded': 'false' },
    innerHTML: getDashboardIcon('menu', 'w-5 h-5'),
  });
  mobileToggle.addEventListener('click', onMobileToggle);

  const titleGroup = createElement('div', { className: 'min-w-0 flex flex-col justify-center' });
  const h1 = createElement('h1', {
    className: 'text-sm sm:text-base lg:text-lg font-black text-[#012622] dark:text-teal-400 truncate tracking-tight',
    textContent: pageTitle,
  });

  titleGroup.appendChild(h1);

  rightGroup.appendChild(mobileToggle);
  rightGroup.appendChild(titleGroup);

  // Center/Left Actions: Search Bar & Theme Selector & Notifications & User Controls
  const leftGroup = createElement('div', { className: 'flex items-center gap-2 sm:gap-3 shrink-0' });

  // Search Control
  const searchContainer = createElement('div', { className: 'hidden md:flex items-center relative w-44 lg:w-60 group' });
  const searchInput = createElement('input', {
    className:
      'w-full bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ps-9 pe-3 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#012622] dark:focus:border-teal-500 focus:ring-2 focus:ring-[#012622]/15 transition-all shadow-2xs',
    attributes: { type: 'text', placeholder: 'جستجو در سامانه...' },
  });
  const searchIcon = createElement('span', {
    className: 'absolute start-2.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 pointer-events-none transition-colors',
    innerHTML: getDashboardIcon('search', 'w-4 h-4'),
  });

  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);

  // Dev Demo Switcher Quick Button
  if (onOpenDemoModal) {
    const demoQuickBtn = createElement('button', {
      className:
        'inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200/90 dark:border-amber-800/80 rounded-xl text-xs font-bold transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#E98A15] min-h-[40px]',
      attributes: { title: 'تغییر نقش آزمایشی دمو' },
    });
    demoQuickBtn.innerHTML = `${getDashboardIcon('swap', 'w-4 h-4 text-amber-700 dark:text-amber-400')} <span class="hidden sm:inline">تغییر نقش دمو</span>`;
    demoQuickBtn.addEventListener('click', onOpenDemoModal);
    leftGroup.appendChild(demoQuickBtn);
  }

  // Theme Selector
  const themeBtn = createThemeSelectorButton();
  leftGroup.appendChild(themeBtn);

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
