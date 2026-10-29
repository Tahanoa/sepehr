/**
 * POLARIS DEV-ONLY DEMO SWITCHER MODAL
 * Grouped selector for all 14 role-and-plan combinations across Elementary, Secondary, and Institute plans with dark mode support.
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
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
    badgeText: 'پایه‌های ۱ تا ۶',
    userIds: ['usr-elem-admin', 'usr-elem-teacher', 'usr-elem-student', 'usr-elem-parent'],
  },
  {
    planTitle: 'طرح B — دبیرستان دوره اول و دوم',
    planSubtitle: 'پوشش پایه‌های هفتم تا دوازدهم، ارزیابی عددی و خدمات مشاوره',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
    badgeText: 'پایه‌های ۷ تا ۱۲',
    userIds: ['usr-sec-admin', 'usr-sec-teacher', 'usr-sec-student', 'usr-sec-parent', 'usr-sec-counselor'],
  },
  {
    planTitle: 'طرح C — آموزشگاه‌های آزاد و مهارتی',
    planSubtitle: 'مؤسسات زبان، آکادمی‌های تخصصی، امور شهریه و ثبت‌نام متقاضیان',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200',
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
      'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]',
    attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'demo-switcher-title' },
  });

  // Modal Header
  const header = createElement('div', {
    className: 'bg-[#012622] dark:bg-[#071513] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
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
    textContent: 'ورود به نسخه دمو — انتخاب نقش و طرح (۱۴ نقش)',
  });
  const sub = createElement('p', {
    className: 'text-xs text-amber-200/90 font-medium',
    textContent: 'پیش‌نمایش کامل و تعاملی سامانه پولاریس بدون نیاز به رمز عبور',
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
    className: 'bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-5 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 shrink-0',
  });
  banner.innerHTML = `${getDashboardIcon('info', 'w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0')}
    <span><strong>محیط آزمایشی دمو:</strong> کلیه داده‌ها محلی و تمام ۱۴ ترکیب نقش و طرح قابل بررسی مستقیم می‌باشند.</span>`;

  // Body: Grouped List
  const body = createElement('div', { className: 'p-5 overflow-y-auto space-y-6 flex-1' });

  const currentSession = authService.getCurrentSession();
  const activeUserId = currentSession?.user.id;

  DEMO_GROUPS.forEach((group) => {
    const groupContainer = createElement('div', { className: 'space-y-3' });

    // Group Title Bar
    const groupHeader = createElement('div', {
      className: 'flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700',
    });

    const titleBox = createElement('div');
    const groupH4 = createElement('h4', {
      className: 'text-sm font-bold text-[#012622] dark:text-teal-400',
      textContent: group.planTitle,
    });
    const groupDesc = createElement('p', {
      className: 'text-[11px] text-gray-500 dark:text-gray-400',
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
        className: `w-full border rounded-xl p-3 flex items-center justify-between gap-3 text-right transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#E98A15] ${
          isCurrent
            ? 'bg-[#ECE5F0] dark:bg-teal-950/60 border-[#012622] dark:border-teal-500 ring-2 ring-[#012622]/20 dark:ring-teal-500/20 shadow-sm'
            : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
        }`,
      });

      const leftBox = createElement('div', { className: 'flex items-center gap-2.5 min-w-0' });

      // Avatar
      const avatar = createElement('div', {
        className: 'w-9 h-9 rounded-full bg-[#012622] dark:bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden',
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
      const userName = createElement('span', { className: 'font-bold text-gray-900 dark:text-gray-100 text-xs truncate', textContent: u.name });

      nameRow.appendChild(userName);

      const roleTitle = createElement('div', {
        className: 'text-[11px] text-[#003B36] dark:text-teal-300 font-semibold truncate',
        textContent: primaryMem.title || primaryMem.role,
      });

      details.appendChild(nameRow);
      details.appendChild(roleTitle);

      leftBox.appendChild(avatar);
      leftBox.appendChild(details);

      const actionBox = createElement('div', { className: 'shrink-0' });

      if (isCurrent) {
        const activeTag = createElement('span', {
          className: 'px-2 py-0.5 bg-[#012622] dark:bg-teal-600 text-white rounded text-[10px] font-bold inline-flex items-center gap-1',
          textContent: 'نقش فعال',
        });
        actionBox.appendChild(activeTag);
      } else {
        const selectBtn = createElement('span', {
          className:
            'px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded transition-colors',
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
    className: 'bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end shrink-0',
  });

  const cancelBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
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
