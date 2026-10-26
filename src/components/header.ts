/**
 * POLARIS HEADER COMPONENT
 * Top bar header with breadcrumbs, page title, mobile toggle, and user profile summary.
 */

import { UserProfile } from '../types/common';
import { createElement } from '../utils/dom';
import { createIconButton } from './button';

export interface HeaderOptions {
  user: UserProfile;
  breadcrumbs: { title: string; path?: string }[];
  onMobileToggle: () => void;
}

export function createHeader(options: HeaderOptions): HTMLElement {
  const { user, breadcrumbs, onMobileToggle } = options;

  const header = createElement('header', { className: 'polaris-header' });

  // Left Section (Mobile Menu Toggle & Breadcrumbs)
  const leftSection = createElement('div', { className: 'polaris-header-left' });

  const mobileToggle = createIconButton({
    ariaLabel: 'باز کردن منوی موبایل',
    iconSvg: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`,
    onClick: onMobileToggle,
    variant: 'ghost',
  });

  const breadcrumbsNav = createElement('nav', {
    className: 'polaris-breadcrumbs',
    attributes: { 'aria-label': 'مسیر صفحه' },
  });

  breadcrumbs.forEach((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;

    if (index > 0) {
      const sep = createElement('span', { className: 'polaris-breadcrumb-separator', textContent: '‹' });
      breadcrumbsNav.appendChild(sep);
    }

    const item = createElement('span', {
      className: `polaris-breadcrumb-item ${isLast ? 'polaris-breadcrumb-item--active' : ''}`,
      textContent: crumb.title,
    });

    breadcrumbsNav.appendChild(item);
  });

  leftSection.appendChild(mobileToggle);
  leftSection.appendChild(breadcrumbsNav);

  // Right Section (User Info Avatar & Quick Actions)
  const rightSection = createElement('div', { className: 'polaris-header-right' });

  const userBox = createElement('div', {
    className: 'flex items-center gap-3',
    innerHTML: `
      <div style="text-align: left;">
        <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-sm); color: var(--color-primary);">${user.name}</div>
        <div style="font-size: var(--font-size-xs); color: var(--color-muted);">${user.roleLabel}</div>
      </div>
      <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--color-dark-green); color: var(--color-lavender-mist); display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid var(--color-amber-earth);">
        ${user.name.charAt(0)}
      </div>
    `,
  });

  rightSection.appendChild(userBox);

  header.appendChild(leftSection);
  header.appendChild(rightSection);

  return header;
}
