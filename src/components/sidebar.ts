/**
 * POLARIS SIDEBAR COMPONENT
 * Responsive navigation sidebar with menu items and collapse toggle.
 */

import { NavItem } from '../types/navigation';
import { createElement } from '../utils/dom';

export function createSidebar(items: NavItem[], activePath: string, onSelect: (path: string) => void): HTMLElement {
  const sidebar = createElement('aside', { className: 'polaris-sidebar', id: 'polaris-sidebar' });

  // Sidebar Brand Header
  const header = createElement('div', { className: 'polaris-sidebar-header' });
  const brand = createElement('a', { className: 'polaris-brand-logo', attributes: { href: '#' } });

  const icon = createElement('div', { className: 'polaris-brand-icon', textContent: 'P' });
  const title = createElement('span', { className: 'polaris-brand-title', textContent: 'سامانه پولاریس' });

  brand.appendChild(icon);
  brand.appendChild(title);
  header.appendChild(brand);

  // Navigation Items
  const nav = createElement('nav', { className: 'polaris-sidebar-nav' });
  const ul = createElement('ul', { className: 'polaris-nav-list' });

  items.forEach((item) => {
    const li = createElement('li');
    const isActive = activePath === item.path;

    const link = createElement('a', {
      className: `polaris-nav-item ${isActive ? 'polaris-nav-item--active' : ''}`,
      attributes: { href: item.path, 'data-path': item.path },
    });

    const navIcon = createElement('span', { className: 'polaris-nav-icon' });
    navIcon.innerHTML = getNavSvg(item.icon);

    const navText = createElement('span', { textContent: item.title });

    link.appendChild(navIcon);
    link.appendChild(navText);

    if (item.badge) {
      const badge = createElement('span', {
        className: 'polaris-badge polaris-badge--warning',
        textContent: String(item.badge),
      });
      badge.style.marginRight = 'auto';
      link.appendChild(badge);
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();
      onSelect(item.path);
    });

    li.appendChild(link);
    ul.appendChild(li);
  });

  nav.appendChild(ul);

  // Sidebar Footer
  const footer = createElement('div', { className: 'polaris-sidebar-footer' });
  const userRoleText = createElement('div', {
    className: 'text-center',
    innerHTML: '<small style="color: var(--color-lavender-mist); opacity: 0.8;">نسخه پایه ۱.۰.۰</small>',
  });
  footer.appendChild(userRoleText);

  sidebar.appendChild(header);
  sidebar.appendChild(nav);
  sidebar.appendChild(footer);

  return sidebar;
}

function getNavSvg(iconName: string): string {
  switch (iconName) {
    case 'dashboard':
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>`;
    case 'users':
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    case 'book':
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    case 'award':
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`;
    case 'chart':
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`;
    case 'settings':
    default:
      return `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
  }
}
