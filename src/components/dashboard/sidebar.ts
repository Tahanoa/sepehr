/**
 * POLARIS SIDEBAR COMPONENT
 * Responsive, role-aware desktop sidebar and mobile drawer navigation.
 */

import { createElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { NavigationItem } from '../../types/navigation';
import { getDashboardIcon } from './icons';
import { createOrganizationSwitcher } from './org-switcher';

export interface SidebarOptions {
  user: User;
  membership: OrganizationMembership;
  navItems: NavigationItem[];
  currentPath: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: (path: string) => void;
}

export function createSidebar(options: SidebarOptions): HTMLElement {
  const {
    user,
    membership,
    navItems,
    currentPath,
    isCollapsed = false,
    onToggleCollapse,
    onNavigate,
  } = options;

  const sidebar = createElement('aside', {
    className: `product-sidebar bg-[rgb(var(--theme-primary))] text-white flex flex-col justify-between transition-all duration-300 h-full relative z-30 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`,
    attributes: { 'aria-label': 'منوی اصلی سامانه' },
  });

  // Top Section: Brand Header & Org Switcher
  const topContainer = createElement('div', { className: 'flex flex-col flex-1 min-h-0' });

  // Brand Header
  const brandHeader = createElement('div', {
    className: 'p-4 border-b border-white/10 flex items-center justify-between gap-3 min-h-[68px]',
  });

  const brandLink = createElement('a', {
    className: 'flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] rounded-xl p-1',
    attributes: { href: `/app/${membership.organizationId}/overview` },
  });

  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(`/app/${membership.organizationId}/overview`);
  });

  // Polaris Logo Mark
  const logoMark = createElement('div', {
    className:
      'brand-monogram w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--theme-accent))] to-[rgb(var(--theme-secondary))] text-white flex items-center justify-center font-semibold text-lg shadow-md shrink-0',
    textContent: 'س',
  });

  const brandTextGroup = createElement('div', { className: `min-w-0 ${isCollapsed ? 'hidden' : 'block'}` });

  const brandName = createElement('div', {
    className: 'text-base font-semibold text-white tracking-tight truncate',
    textContent: 'سپهر',
  });

  const brandTag = createElement('div', {
    className: 'text-[11px] text-amber-300/80 font-medium truncate',
    textContent: 'سامانه جامع آموزشی',
  });

  brandTextGroup.appendChild(brandName);
  brandTextGroup.appendChild(brandTag);

  brandLink.appendChild(logoMark);
  brandLink.appendChild(brandTextGroup);

  brandHeader.appendChild(brandLink);

  // Desktop collapse toggle button
  if (onToggleCollapse) {
    const toggleBtn = createElement('button', {
      className:
        'hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      attributes: {
        'aria-label': isCollapsed ? 'گسترش منو' : 'جمع کردن منو',
      },
      innerHTML: getDashboardIcon(isCollapsed ? 'chevron-left' : 'chevron-right', 'w-4 h-4 rtl:rotate-180'),
    });

    toggleBtn.addEventListener('click', onToggleCollapse);
    brandHeader.appendChild(toggleBtn);
  }

  topContainer.appendChild(brandHeader);

  // Active Organization Info / Switcher Widget
  if (!isCollapsed) {
    const orgBox = createElement('div', { className: 'p-3 border-b border-white/10' });

    const switcher = createOrganizationSwitcher(
      user.memberships,
      membership.id,
      (selectedMembershipId) => {
        const selected = user.memberships.find((m) => m.id === selectedMembershipId);
        if (selected && onNavigate) {
          onNavigate(`/app/${selected.organizationId}/overview`);
        }
      }
    );

    orgBox.appendChild(switcher);
    topContainer.appendChild(orgBox);
  }

  // Navigation Links List
  const navContainer = createElement('nav', {
    className: 'flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin',
    attributes: { 'aria-label': 'ناوبری' },
  });

  const navList = createElement('ul', { className: 'space-y-1' });

  const groups = [
    ['فضای کار', ['overview']],
    ['آموزش و یادگیری', ['classes','courses','students','children','teachers','instructors','schedule','attendance','assignments','exams','grades','materials']],
    ['ارتباط و همراهی', ['messages','announcements','counseling','progress']],
    ['مدیریت مرکز', ['reports','payments','settings','registration','status']]
  ] as const;
  const grouped = groups.flatMap(([label, keys]) => navItems.filter(item => (keys as readonly string[]).includes(item.sectionKey || '')).map((item, i) => ({ item, label: i === 0 ? label : '' })));
  for (const item of navItems) if (!grouped.some(g => g.item === item)) grouped.push({ item, label: '' });
  grouped.forEach(({item, label}) => {
    if (label && !isCollapsed) navList.appendChild(createElement('li', { className: 'nav-group-label', textContent: label }));
    const isCurrent =
      currentPath === item.path ||
      (item.sectionKey !== undefined && currentPath.includes(item.sectionKey) && item.sectionKey !== 'overview');

    const li = createElement('li');

    const link = createElement('a', {
      className: `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] ${
        isCurrent
          ? 'bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] font-semibold shadow-sm'
          : 'text-gray-200 hover:bg-[rgb(var(--theme-hover))] hover:text-white'
      }`,
      attributes: {
        href: item.path,
        'aria-current': isCurrent ? 'page' : 'false',
        title: isCollapsed ? item.title : '',
      },
    });

    const leftGroup = createElement('div', { className: 'flex items-center gap-3 min-w-0' });

    const iconWrapper = createElement('span', {
      className: `shrink-0 ${isCurrent ? 'text-[rgb(var(--theme-primary))]' : 'text-gray-300 group-hover:text-white'}`,
      innerHTML: getDashboardIcon(item.icon, 'w-5 h-5'),
    });

    const titleSpan = createElement('span', {
      className: `truncate ${isCollapsed ? 'hidden' : 'block'}`,
      textContent: item.title,
    });

    leftGroup.appendChild(iconWrapper);
    leftGroup.appendChild(titleSpan);

    link.appendChild(leftGroup);

    if (item.badge !== undefined && !isCollapsed) {
      const badgeSpan = createElement('span', {
        className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isCurrent ? 'bg-[rgb(var(--theme-primary))] text-white' : 'bg-[rgb(var(--theme-subtle))]/20 text-white'
        }`,
        textContent: String(item.badge),
      });
      link.appendChild(badgeSpan);
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (onNavigate) onNavigate(item.path);
    });

    li.appendChild(link);
    navList.appendChild(li);
  });

  navContainer.appendChild(navList);
  topContainer.appendChild(navContainer);

  // Footer Section
  const footerContainer = createElement('div', {
    className: 'shrink-0 p-3 border-t border-white/10 bg-[rgb(var(--theme-hover))]/60 flex flex-col gap-2',
  });

  if (!isCollapsed) {
    const demoTag = createElement('div', {
      className:
        'px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[11px] font-semibold flex items-center justify-between dir-rtl',
    });
    demoTag.innerHTML = `<span>داده‌های آزمایشی</span> <span class="bg-amber-400 text-gray-950 text-[9px] px-1.5 py-0.2 rounded font-semibold">DEMO</span>`;
    footerContainer.appendChild(demoTag);
  }

  sidebar.appendChild(topContainer);
  sidebar.appendChild(footerContainer);

  return sidebar;
}

export function createMobileNavigationDrawer(
  options: SidebarOptions,
  isOpen: boolean,
  onClose: () => void
): HTMLElement {
  // Prevent background body scrolling when drawer is active
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  const previousFocus = document.activeElement as HTMLElement | null;
  const handleClose = () => {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyDown);
    onClose();
    previousFocus?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && isOpen) {
      const items = Array.from(drawer.querySelectorAll<HTMLElement>('button, a[href], select')).filter(el => el.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    if (e.key === 'Escape' && isOpen) {
      handleClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleKeyDown);
  }

  const backdrop = createElement('div', {
    className: `fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`,
  });

  const drawer = createElement('div', {
    className: `fixed top-0 start-0 bottom-0 w-80 max-w-[85vw] bg-[rgb(var(--theme-primary))] text-white z-50 transition-transform duration-300 ease-out transform lg:hidden flex flex-col shadow-2xl ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`,
    attributes: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'منوی ناوبری همراه',
    },
  });

  const closeBtn = createElement('button', {
    className: 'absolute top-3.5 end-3.5 p-2.5 text-gray-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] z-40 min-w-[44px] min-h-[44px] flex items-center justify-center',
    attributes: { 'aria-label': 'بستن منو' },
    innerHTML: getDashboardIcon('close', 'w-5 h-5'),
  });
  closeBtn.addEventListener('click', handleClose);

  const sidebarContent = createSidebar({
    ...options,
    isCollapsed: false,
    onNavigate: (path) => {
      handleClose();
      if (options.onNavigate) options.onNavigate(path);
    },
  });

  drawer.appendChild(closeBtn);
  sidebarContent.classList.remove('w-72');
  sidebarContent.classList.add('w-full');
  drawer.appendChild(sidebarContent);

  backdrop.appendChild(drawer);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });

  if (isOpen) requestAnimationFrame(() => closeBtn.focus());
  return backdrop;
}

