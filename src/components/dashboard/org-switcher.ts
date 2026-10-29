/**
 * POLARIS ORGANIZATION SWITCHER COMPONENT
 * Interactive switcher for users with multiple organization memberships.
 */

import { createElement } from '../../utils/dom';
import { OrganizationMembership } from '../../types/auth';
import { authService } from '../../services/auth-service';
import { getDashboardIcon, getOrgTypeLabel, getRoleLabel } from './icons';

export function createOrganizationSwitcher(
  memberships: OrganizationMembership[],
  activeMembershipId: string,
  onSelect: (membershipId: string) => void
): HTMLElement {
  const container = createElement('div', { className: 'relative w-full' });

  const active = memberships.find((m) => m.id === activeMembershipId) || memberships[0];

  if (!active) {
    return container;
  }

  const trigger = createElement('button', {
    className:
      'w-full bg-[rgb(var(--theme-hover))] hover:brightness-110 border border-[rgb(var(--theme-primary))]/50 text-white rounded-xl p-2.5 flex items-center justify-between gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    attributes: { 'aria-expanded': 'false', 'aria-haspopup': 'true', label: 'انتخاب مرکز آموزشی' },
  });

  const leftBox = createElement('div', { className: 'flex items-center gap-2.5 min-w-0 text-right' });

  const iconBadge = createElement('div', {
    className: 'p-1.5 rounded-lg bg-[rgb(var(--theme-subtle))]/20 text-[rgb(var(--theme-subtle))] shrink-0',
    innerHTML: getDashboardIcon('building', 'w-4 h-4'),
  });

  const titleGroup = createElement('div', { className: 'min-w-0' });

  const orgName = createElement('div', {
    className: 'text-xs font-bold text-white truncate max-w-[160px]',
    textContent: active.organization.name,
  });

  const subMeta = createElement('div', {
    className: 'text-[11px] text-gray-300 flex items-center gap-1 truncate',
  });
  subMeta.innerHTML = `<span class="bg-[rgb(var(--theme-subtle))]/20 text-white px-1.5 py-0.2 rounded font-medium">${getOrgTypeLabel(
    active.organization.type
  )}</span> <span class="opacity-75">• ${getRoleLabel(active.role)}</span>`;

  titleGroup.appendChild(orgName);
  titleGroup.appendChild(subMeta);

  leftBox.appendChild(iconBadge);
  leftBox.appendChild(titleGroup);

  const swapIcon = createElement('span', {
    className: 'text-gray-300 shrink-0',
    innerHTML: getDashboardIcon('swap', 'w-4 h-4'),
  });

  trigger.appendChild(leftBox);
  if (memberships.length > 1) {
    trigger.appendChild(swapIcon);
  }

  // Dropdown menu
  const menu = createElement('div', {
    className:
      'hidden absolute top-full start-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1.5 divide-y divide-gray-100 dir-rtl animate-pop-in',
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

  memberships.forEach((m) => {
    const isCurrent = m.id === activeMembershipId;
    const option = createElement('button', {
      className: `w-full text-right px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] ${
        isCurrent ? 'bg-[rgb(var(--theme-subtle))]/50 font-bold text-[rgb(var(--theme-primary))]' : 'hover:bg-gray-50 text-gray-700'
      }`,
    });

    const optionText = createElement('div', { className: 'min-w-0' });
    const name = createElement('div', { className: 'font-semibold text-gray-900 truncate', textContent: m.organization.name });
    const roleMeta = createElement('div', {
      className: 'text-[11px] text-gray-500',
      textContent: `${getOrgTypeLabel(m.organization.type)} | ${getRoleLabel(m.role)}`,
    });

    optionText.appendChild(name);
    optionText.appendChild(roleMeta);

    option.appendChild(optionText);

    if (isCurrent) {
      const check = createElement('span', {
        className: 'text-[rgb(var(--theme-primary))] shrink-0 font-bold',
        innerHTML: getDashboardIcon('attendance', 'w-4 h-4'),
      });
      option.appendChild(check);
    }

    option.addEventListener('click', () => {
      closeMenu();
      authService.setActiveMembership(m.id);
      onSelect(m.id);
    });

    menu.appendChild(option);
  });

  if (memberships.length > 1) {
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
  }

  container.appendChild(trigger);
  if (memberships.length > 1) {
    container.appendChild(menu);
  }

  return container;
}
