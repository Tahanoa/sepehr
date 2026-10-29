/**
 * POLARIS DEV-ONLY DEMO SWITCHER MODAL
 * Grouped selector for all 14 role-and-plan combinations across Elementary, Secondary, and Institute plans.
 */

import { createElement } from '../../utils/dom';
import { DEMO_USERS } from '../../data/demo-data';
import { authService } from '../../services/auth-service';
import { getDashboardIcon } from './icons';

interface DemoGroup {
  planTitle: string;
  planSubtitle: string;
  badgeBg: string;
  badgeText: string;
  userIds: string[];
}

const DEMO_GROUPS: DemoGroup[] = [
  {
    planTitle: 'طرح A — دبستان و پیش‌دبستانی',
    planSubtitle: 'پوشش پایه‌های اول تا ششم با رویکرد توصیفی و تعاملی',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    badgeText: 'پایه‌های ۱ تا ۶',
    userIds: ['usr-elem-admin', 'usr-elem-teacher', 'usr-elem-student', 'usr-elem-parent'],
  },
  {
    planTitle: 'طرح B — دبیرستان دوره اول و دوم',
    planSubtitle: 'پوشش پایه‌های هفتم تا دوازدهم، ارزیابی عددی و خدمات مشاوره',
    badgeBg: 'bg-blue-100 text-blue-800',
    badgeText: 'پایه‌های ۷ تا ۱۲',
    userIds: ['usr-sec-admin', 'usr-sec-teacher', 'usr-sec-student', 'usr-sec-parent', 'usr-sec-counselor'],
  },
  {
    planTitle: 'طرح C — آموزشگاه‌های آزاد و مهارتی',
    planSubtitle: 'مؤسسات زبان، آکادمی‌های تخصصی، امور شهریه و ثبت‌نام متقاضیان',
    badgeBg: 'bg-amber-100 text-amber-900',
    badgeText: 'آموزشگاه‌های آزاد',
    userIds: ['usr-inst-admin', 'usr-inst-instructor', 'usr-inst-student', 'usr-inst-parent', 'usr-inst-applicant'],
  },
];

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
      'bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]',
    attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'demo-switcher-title' },
  });

  // Modal Header
  const header = createElement('div', {
    className: 'bg-[rgb(var(--theme-primary))] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });

  const headerTitleGroup = createElement('div', { className: 'flex items-center gap-3' });
  const icon = createElement('div', {
    className: 'p-2 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] rounded-xl font-bold',
    innerHTML: getDashboardIcon('swap', 'w-5 h-5'),
  });

  const titleText = createElement('div');
  const h3 = createElement('h3', {
    id: 'demo-switcher-title',
    className: 'text-base font-semibold text-white',
    textContent: 'ورود به نسخه دمو — انتخاب نقش و طرح (۱۴ نقش)',
  });
  const sub = createElement('p', {
    className: 'text-xs text-amber-200/90 font-medium',
    textContent: 'پیش‌نمایش کامل و تعاملی سامانه سپهر بدون نیاز به رمز عبور',
  });

  titleText.appendChild(h3);
  titleText.appendChild(sub);

  headerTitleGroup.appendChild(icon);
  headerTitleGroup.appendChild(titleText);

  const closeBtn = createElement('button', {
    className: 'text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
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
    <span><strong>محیط آزمایشی دمو:</strong> کلیه داده‌ها محلی و تمام ۱۴ ترکیب نقش و طرح قابل بررسی مستقیم می‌باشند.</span>`;

  // Body: Grouped List
  const body = createElement('div', { className: 'p-5 overflow-y-auto space-y-6 flex-1' });

  const currentSession = authService.getCurrentSession();
  const activeUserId = currentSession?.user.id;

  DEMO_GROUPS.forEach((group) => {
    const groupContainer = createElement('div', { className: 'space-y-3' });

    // Group Title Bar
    const groupHeader = createElement('div', {
      className: 'flex items-center justify-between pb-2 border-b border-gray-200',
    });

    const titleBox = createElement('div');
    const groupH4 = createElement('h4', {
      className: 'text-sm font-bold text-[rgb(var(--theme-primary))]',
      textContent: group.planTitle,
    });
    const groupDesc = createElement('p', {
      className: 'text-[11px] text-gray-500',
      textContent: group.planSubtitle,
    });
    titleBox.appendChild(groupH4);
    titleBox.appendChild(groupDesc);

    const badge = createElement('span', {
      className: `px-2.5 py-1 rounded-full text-[11px] font-bold ${group.badgeBg}`,
      textContent: group.badgeText,
    });

    groupHeader.appendChild(titleBox);
    groupHeader.appendChild(badge);

    // Cards Grid
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-2.5' });

    group.userIds.forEach((uId) => {
      const u = DEMO_USERS.find((user) => user.id === uId);
      if (!u) return;

      const isCurrent = u.id === activeUserId;
      const primaryMem = u.memberships[0]!;

      const card = createElement('button', {
        className: `w-full border rounded-xl p-3 flex items-center justify-between gap-3 text-right transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] ${
          isCurrent
            ? 'bg-[rgb(var(--theme-subtle))] border-[rgb(var(--theme-primary))] ring-2 ring-[rgb(var(--theme-primary))]/20 shadow-sm'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`,
      });

      const leftBox = createElement('div', { className: 'flex items-center gap-2.5 min-w-0' });

      // Avatar
      const avatar = createElement('div', {
        className: 'w-9 h-9 rounded-full bg-[rgb(var(--theme-primary))] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden',
      });

      if (u.avatarUrl) {
        const img = createElement('img', { className: 'w-full h-full object-cover', attributes: { src: u.avatarUrl, alt: u.name } });
        avatar.appendChild(img);
      } else {
        avatar.textContent = u.name.slice(0, 2);
      }

      // Details
      const details = createElement('div', { className: 'min-w-0' });
      const nameRow = createElement('div', { className: 'flex items-center gap-1.5' });
      const userName = createElement('span', { className: 'font-bold text-gray-900 text-xs truncate', textContent: u.name });

      nameRow.appendChild(userName);

      const roleTitle = createElement('div', {
        className: 'text-[11px] text-[rgb(var(--theme-hover))] font-semibold truncate',
        textContent: primaryMem.title || primaryMem.role,
      });

      details.appendChild(nameRow);
      details.appendChild(roleTitle);

      leftBox.appendChild(avatar);
      leftBox.appendChild(details);

      const actionBox = createElement('div', { className: 'shrink-0' });

      if (isCurrent) {
        const activeTag = createElement('span', {
          className: 'px-2 py-0.5 bg-[rgb(var(--theme-primary))] text-white rounded text-[10px] font-bold inline-flex items-center gap-1',
          textContent: 'نقش فعال',
        });
        actionBox.appendChild(activeTag);
      } else {
        const selectBtn = createElement('span', {
          className:
            'px-2.5 py-1 bg-gray-100 group-hover:bg-[rgb(var(--theme-primary))] text-gray-700 text-xs font-bold rounded transition-colors',
          textContent: 'ورود',
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

      grid.appendChild(card);
    });

    groupContainer.appendChild(groupHeader);
    groupContainer.appendChild(grid);
    body.appendChild(groupContainer);
  });

  // Footer
  const footer = createElement('div', {
    className: 'bg-gray-50 border-t border-gray-200 p-4 flex justify-end shrink-0',
  });

  const cancelBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
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
