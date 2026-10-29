/**
 * POLARIS USER MENU & NOTIFICATION BUTTON COMPONENTS
 * Profile dropdown menu, demo switcher trigger, and notification popover with dark mode support.
 */

import { createElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { authService } from '../../services/auth-service';
import { getDashboardIcon, getRoleLabel } from './icons';

export interface UserMenuOptions {
  user: User;
  membership: OrganizationMembership;
  onOpenDemoModal?: (() => void) | undefined;
}

export function createUserMenu(options: UserMenuOptions): HTMLElement {
  const { user, membership, onOpenDemoModal } = options;

  const container = createElement('div', { className: 'relative' });

  const trigger = createElement('button', {
    className:
      'flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    attributes: { 'aria-expanded': 'false', 'aria-haspopup': 'true', label: 'منوی کاربری' },
  });

  // Avatar or Initials
  const avatarBox = createElement('div', {
    className: 'w-9 h-9 rounded-full bg-[#012622] dark:bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border border-white/20 shrink-0',
  });

  if (user.avatarUrl) {
    const img = createElement('img', {
      className: 'w-full h-full object-cover',
      attributes: { src: user.avatarUrl, alt: user.name },
    });
    avatarBox.appendChild(img);
  } else {
    avatarBox.textContent = user.name.slice(0, 2);
  }

  // Name & Role Label
  const textGroup = createElement('div', { className: 'hidden sm:block text-right min-w-0' });
  const name = createElement('div', { className: 'text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[130px]', textContent: user.name });
  const roleLabel = createElement('div', {
    className: 'text-[11px] text-gray-500 dark:text-gray-400 truncate',
    textContent: getRoleLabel(membership.role),
  });

  textGroup.appendChild(name);
  textGroup.appendChild(roleLabel);

  const chevron = createElement('span', {
    className: 'text-gray-400 dark:text-gray-500 hidden sm:block',
    innerHTML: getDashboardIcon('chevron-down', 'w-4 h-4'),
  });

  trigger.appendChild(avatarBox);
  trigger.appendChild(textGroup);
  trigger.appendChild(chevron);

  // Dropdown Menu
  const menu = createElement('div', {
    className:
      'hidden absolute end-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700 z-50 py-2 divide-y divide-gray-100 dark:divide-gray-700 text-xs dir-rtl animate-pop-in',
  });

  const closeMenu = () => {
    menu.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  // User info header
  const menuHeader = createElement('div', { className: 'px-4 py-2.5' });
  const headerName = createElement('div', { className: 'font-bold text-gray-900 dark:text-gray-100 text-sm truncate', textContent: user.name });
  const headerEmail = createElement('div', { className: 'text-gray-500 dark:text-gray-400 text-[11px] truncate', textContent: user.email });
  const roleBadge = createElement('span', {
    className: 'inline-block mt-1 px-2 py-0.5 bg-[#ECE5F0] dark:bg-teal-900/50 text-[#012622] dark:text-teal-200 rounded-full text-[10px] font-bold',
    textContent: getRoleLabel(membership.role),
  });

  menuHeader.appendChild(headerName);
  menuHeader.appendChild(headerEmail);
  menuHeader.appendChild(roleBadge);

  const menuActions = createElement('div', { className: 'py-1' });

  // Dev Demo Switcher Link if in Dev Mode
  if (import.meta.env.DEV && onOpenDemoModal) {
    const demoBtn = createElement('button', {
      className: 'w-full text-right px-4 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });
    demoBtn.innerHTML = `${getDashboardIcon('swap', 'w-4 h-4 text-amber-700 dark:text-amber-400')} تغییر نقش دمو (توسعه)`;
    demoBtn.addEventListener('click', () => {
      closeMenu();
      onOpenDemoModal();
    });
    menuActions.appendChild(demoBtn);
  }

  // Sign out action
  const signOutBtn = createElement('button', {
    className: 'w-full text-right px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
  });
  signOutBtn.innerHTML = `${getDashboardIcon('logout', 'w-4 h-4')} خروج از سامانه`;
  signOutBtn.addEventListener('click', async () => {
    closeMenu();
    await authService.signOut();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/login' }));
  });

  menuActions.appendChild(signOutBtn);

  menu.appendChild(menuHeader);
  menu.appendChild(menuActions);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', handleKeyDown);
    } else {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      closeMenu();
    }
  });

  container.appendChild(trigger);
  container.appendChild(menu);

  return container;
}

export function createNotificationButton(): HTMLElement {
  const container = createElement('div', { className: 'relative' });

  const btn = createElement('button', {
    className:
      'p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#E98A15] min-w-[40px] min-h-[40px] flex items-center justify-center',
    attributes: { 'aria-label': 'اعلان‌ها', 'aria-expanded': 'false' },
    innerHTML: getDashboardIcon('bell', 'w-5 h-5'),
  });

  // Demo notification dot
  const badge = createElement('span', {
    className: 'absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[#E98A15] ring-2 ring-white dark:ring-gray-900',
  });
  btn.appendChild(badge);

  // Notification Popover
  const popover = createElement('div', {
    className:
      'hidden absolute end-0 top-full mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4 text-right text-xs dir-rtl animate-pop-in',
  });

  const closePopover = () => {
    popover.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePopover();
    }
  };

  const header = createElement('div', { className: 'flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700' });
  const title = createElement('span', { className: 'font-bold text-gray-900 dark:text-gray-100 text-sm', textContent: 'اعلان‌های سامانه' });
  const tag = createElement('span', { className: 'px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded text-[10px] font-medium', textContent: 'حالت دمو' });

  header.appendChild(title);
  header.appendChild(tag);

  const list = createElement('div', { className: 'space-y-2.5 my-2' });

  const notif1 = createElement('div', { className: 'p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 space-y-0.5' });
  notif1.innerHTML = `<div class="font-bold text-gray-900 dark:text-gray-100">برنامه‌ریزی ترم جدید</div><div class="text-[11px] text-gray-500 dark:text-gray-400">تقویم آموزشی ترم بهار بروزرسانی گردید.</div>`;

  const notif2 = createElement('div', { className: 'p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 space-y-0.5' });
  notif2.innerHTML = `<div class="font-bold text-gray-900 dark:text-gray-100">ارسال گزارش ماهانه</div><div class="text-[11px] text-gray-500 dark:text-gray-400">گزارش عملکرد تحصیلی آماده دریافت است.</div>`;

  list.appendChild(notif1);
  list.appendChild(notif2);

  const footer = createElement('div', { className: 'pt-2 border-t border-gray-100 dark:border-gray-700 text-center text-[11px] text-gray-400 dark:text-gray-500 font-medium' });
  footer.textContent = 'هیچ اعلان خوانی‌نشده جدیدی وجود ندارد.';

  popover.appendChild(header);
  popover.appendChild(list);
  popover.appendChild(footer);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
      popover.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', handleKeyDown);
    } else {
      closePopover();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target as Node)) {
      closePopover();
    }
  });

  container.appendChild(btn);
  container.appendChild(popover);

  return container;
}
