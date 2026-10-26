/**
 * POLARIS DEV-ONLY DEMO SWITCHER MODAL
 * Preview dashboard as school_admin, teacher, student, parent, counselor,
 * institute_admin, or instructor across elementary, secondary, and institute orgs.
 */

import { createElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { DEMO_USERS } from '../../data/demo-data';
import { authService } from '../../services/auth-service';
import { getDashboardIcon, getOrgTypeLabel, getRoleLabel } from './icons';

export function createDemoSwitcherModal(onClose: () => void): HTMLElement {
  const backdrop = createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl animate-fadeIn',
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      onClose();
    }
  };

  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
  };

  document.addEventListener('keydown', handleKeyDown);

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const dialog = createElement('div', {
    className:
      'bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]',
    attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'demo-switcher-title' },
  });

  // Modal Header
  const header = createElement('div', {
    className: 'bg-[#012622] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });

  const headerTitleGroup = createElement('div', { className: 'flex items-center gap-3' });
  const icon = createElement('div', {
    className: 'p-2 bg-[#E98A15] text-[#012622] rounded-xl font-bold',
    innerHTML: getDashboardIcon('swap', 'w-5 h-5'),
  });

  const titleText = createElement('div');
  const h3 = createElement('h3', {
    id: 'demo-switcher-title',
    className: 'text-base font-extrabold text-white',
    textContent: 'تغییر نقش دمو (محیط توسعه)',
  });
  const sub = createElement('p', {
    className: 'text-xs text-amber-200/90 font-medium',
    textContent: 'پیش‌نمایش تعاملی پنل پولاریس با هویت‌های آزمایشی مختلف',
  });

  titleText.appendChild(h3);
  titleText.appendChild(sub);

  headerTitleGroup.appendChild(icon);
  headerTitleGroup.appendChild(titleText);

  const closeBtn = createElement('button', {
    className: 'text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    attributes: { 'aria-label': 'بستن پنجره' },
    innerHTML: getDashboardIcon('close', 'w-5 h-5'),
  });
  closeBtn.addEventListener('click', handleClose);

  header.appendChild(headerTitleGroup);
  header.appendChild(closeBtn);

  // Notice Banner
  const banner = createElement('div', {
    className: 'bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center gap-2 shrink-0',
  });
  banner.innerHTML = `${getDashboardIcon('info', 'w-4 h-4 text-amber-700 shrink-0')}
    <span><strong>توجه:</strong> تغییر هویت در این پنجره صرفاً جهت تست و بررسی رابط کاربری دمو بوده و در نسخه تولیدی صادر نخواهد شد.</span>`;

  // Body: User Cards Grid
  const body = createElement('div', { className: 'p-5 overflow-y-auto space-y-3 flex-1' });

  const currentSession = authService.getCurrentSession();
  const activeUserId = currentSession?.user.id;

  DEMO_USERS.forEach((u: User) => {
    const isCurrent = u.id === activeUserId;
    const primaryMembership = u.memberships.find((m: OrganizationMembership) => m.isPrimary) || u.memberships[0]!;

    const card = createElement('button', {
      className: `w-full border rounded-xl p-4 flex items-center justify-between gap-3 text-right transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#E98A15] ${
        isCurrent
          ? 'bg-[#ECE5F0]/60 border-[#012622] ring-2 ring-[#012622]/20 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`,
    });

    const leftBox = createElement('div', { className: 'flex items-center gap-3 min-w-0' });

    // Avatar
    const avatar = createElement('div', {
      className: 'w-10 h-10 rounded-full bg-[#012622] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden',
    });

    if (u.avatarUrl) {
      const img = createElement('img', { className: 'w-full h-full object-cover', attributes: { src: u.avatarUrl, alt: u.name } });
      avatar.appendChild(img);
    } else {
      avatar.textContent = u.name.slice(0, 2);
    }

    // Details
    const details = createElement('div', { className: 'min-w-0' });

    const nameRow = createElement('div', { className: 'flex items-center gap-2 mb-0.5' });
    const userName = createElement('span', { className: 'font-bold text-gray-900 text-xs truncate', textContent: u.name });
    const roleBadge = createElement('span', {
      className: 'px-2 py-0.5 bg-[#012622] text-white rounded-md text-[10px] font-bold shrink-0',
      textContent: getRoleLabel(primaryMembership.role),
    });

    nameRow.appendChild(userName);
    nameRow.appendChild(roleBadge);

    const orgMeta = createElement('div', {
      className: 'text-[11px] text-gray-500 truncate',
      textContent: `${primaryMembership.organization.name} (${getOrgTypeLabel(primaryMembership.organization.type)})`,
    });

    details.appendChild(nameRow);
    details.appendChild(orgMeta);

    leftBox.appendChild(avatar);
    leftBox.appendChild(details);

    const actionBox = createElement('div', { className: 'shrink-0' });

    if (isCurrent) {
      const activeTag = createElement('span', {
        className: 'px-2.5 py-1 bg-[#012622] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1',
      });
      activeTag.innerHTML = `${getDashboardIcon('attendance', 'w-3.5 h-3.5')} کاربر فعال`;
      actionBox.appendChild(activeTag);
    } else {
      const selectBtn = createElement('span', {
        className:
          'px-3 py-1.5 bg-gray-100 group-hover:bg-[#012622] text-gray-700 text-xs font-bold rounded-lg transition-colors',
        textContent: 'انتخاب دمو',
      });
      actionBox.appendChild(selectBtn);
    }

    card.appendChild(leftBox);
    card.appendChild(actionBox);

    card.addEventListener('click', () => {
      const newSession = authService.switchDemoUser(u.id);
      if (newSession) {
        handleClose();
        const activeMem = authService.getActiveMembership();
        if (activeMem) {
          window.dispatchEvent(
            new CustomEvent('polaris-navigate', { detail: `/app/${activeMem.organizationId}/overview` })
          );
        }
      }
    });

    body.appendChild(card);
  });

  // Footer
  const footer = createElement('div', {
    className: 'bg-gray-50 border-t border-gray-200 p-4 flex justify-end shrink-0',
  });

  const cancelBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    textContent: 'انصراف',
  });
  cancelBtn.addEventListener('click', handleClose);

  footer.appendChild(cancelBtn);

  dialog.appendChild(header);
  dialog.appendChild(banner);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  backdrop.appendChild(dialog);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });

  return backdrop;
}
