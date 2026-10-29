/**
 * POLARIS SHARED DASHBOARD LAYOUT COMPONENT
 * Main viewport controller connecting responsive sidebar, header, content body,
 * and dev-only demo switcher modal.
 */

import { createElement, clearElement } from '../../utils/dom';
import { User, OrganizationMembership } from '../../types/auth';
import { NavigationItem } from '../../types/navigation';
import { createSidebar, createMobileNavigationDrawer } from './sidebar';
import { createDashboardHeader } from './header';
import { createDemoSwitcherModal } from './demo-switcher-modal';
import { schoolStore } from '../../services/school-store';
import { getRoleLabel } from './icons';

export interface DashboardLayoutOptions {
  user: User;
  membership: OrganizationMembership;
  navItems: NavigationItem[];
  currentPath: string;
  pageTitle: string;
  content: HTMLElement;
  onNavigate: (path: string) => void;
}

export class DashboardLayout {
  private rootEl: HTMLElement;
  private sidebarContainerEl: HTMLElement;
  private mainWrapperEl: HTMLElement;
  private headerContainerEl: HTMLElement;
  private contentViewportEl: HTMLElement;
  private modalContainerEl: HTMLElement;

  private isCollapsed: boolean = false;
  private isMobileOpen: boolean = false;

  private user: User;
  private membership: OrganizationMembership;
  private navItems: NavigationItem[];
  private currentPath: string;
  private pageTitle: string;
  private content: HTMLElement;
  private onNavigate: (path: string) => void;

  constructor(options: DashboardLayoutOptions) {
    this.user = options.user;
    this.membership = options.membership;
    this.navItems = options.navItems;
    this.currentPath = options.currentPath;
    this.pageTitle = options.pageTitle;
    this.content = options.content;
    this.onNavigate = options.onNavigate;

    this.rootEl = createElement('div', {
      className: 'min-h-screen bg-gray-50 text-gray-900 font-sans dir-rtl overflow-x-hidden relative',
    });

    this.sidebarContainerEl = createElement('div', {
      className: 'hidden lg:block fixed start-0 top-0 bottom-0 z-30 transition-all duration-300',
    });

    this.modalContainerEl = createElement('div', { id: 'dashboard-modal-container' });

    this.mainWrapperEl = createElement('div', {
      className: `flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
        this.isCollapsed ? 'lg:ms-20' : 'lg:ms-72'
      }`,
    });

    // Top Demo Banner
    const demoBanner = this.createDemoBanner();

    this.headerContainerEl = createElement('div', { className: 'w-full shrink-0' });
    this.contentViewportEl = createElement('main', {
      id: 'dashboard-main-content',
      className: 'flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-200',
    });

    this.contentViewportEl.appendChild(this.content);

    this.mainWrapperEl.appendChild(demoBanner);
    this.mainWrapperEl.appendChild(this.headerContainerEl);
    this.mainWrapperEl.appendChild(this.contentViewportEl);

    this.rootEl.appendChild(this.sidebarContainerEl);
    this.rootEl.appendChild(this.mainWrapperEl);
    this.rootEl.appendChild(this.modalContainerEl);

    this.renderSidebar();
    this.renderHeader();
  }

  public getRootElement(): HTMLElement {
    return this.rootEl;
  }

  public updateState(
    user: User,
    membership: OrganizationMembership,
    navItems: NavigationItem[],
    currentPath: string,
    pageTitle: string,
    content: HTMLElement
  ): void {
    this.user = user;
    this.membership = membership;
    this.navItems = navItems;
    this.currentPath = currentPath;
    this.pageTitle = pageTitle;
    this.content = content;

    this.isMobileOpen = false;
    const existingDrawer = document.getElementById('mobile-drawer-root');
    if (existingDrawer) {
      existingDrawer.remove();
      document.body.style.overflow = '';
    }

    this.renderSidebar();
    this.renderHeader();

    clearElement(this.contentViewportEl);
    this.contentViewportEl.className =
      'flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-200 animate-fade-in-up min-w-0';
    this.contentViewportEl.appendChild(this.content);
  }

  private renderSidebar(): void {
    clearElement(this.sidebarContainerEl);

    this.mainWrapperEl.className = `flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
      this.isCollapsed ? 'lg:ms-20' : 'lg:ms-72'
    }`;

    const sidebar = createSidebar({
      user: this.user,
      membership: this.membership,
      navItems: this.navItems,
      currentPath: this.currentPath,
      isCollapsed: this.isCollapsed,
      onToggleCollapse: () => {
        this.isCollapsed = !this.isCollapsed;
        this.renderSidebar();
      },
      onNavigate: this.onNavigate,
    });

    this.sidebarContainerEl.appendChild(sidebar);
  }

  private renderHeader(): void {
    clearElement(this.headerContainerEl);

    const header = createDashboardHeader({
      user: this.user,
      membership: this.membership,
      pageTitle: this.pageTitle,
      onMobileToggle: () => this.toggleMobileDrawer(),
      onOpenDemoModal: () => this.openDemoModal(),
    });

    this.headerContainerEl.appendChild(header);
  }

  private toggleMobileDrawer(): void {
    this.isMobileOpen = !this.isMobileOpen;

    // Render mobile overlay drawer
    const drawer = createMobileNavigationDrawer(
      {
        user: this.user,
        membership: this.membership,
        navItems: this.navItems,
        currentPath: this.currentPath,
        onNavigate: (path) => {
          this.isMobileOpen = false;
          this.onNavigate(path);
        },
      },
      this.isMobileOpen,
      () => {
        this.isMobileOpen = false;
        this.renderSidebar();
        document.getElementById('mobile-drawer-root')?.remove();
        this.headerContainerEl.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
      }
    );

    const existingDrawer = document.getElementById('mobile-drawer-root');
    if (existingDrawer) {
      existingDrawer.remove();
    }
    drawer.id = 'mobile-drawer-root';
    this.rootEl.appendChild(drawer);
    this.headerContainerEl.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', String(this.isMobileOpen));
  }

  private createDemoBanner(): HTMLElement {
    const banner = createElement('div', {
      className: 'sepehr-demo-banner text-white px-4 py-2 border-b border-[rgb(var(--theme-accent))]/40 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 z-20',
    });

    const infoBox = createElement('div', { className: 'flex items-center gap-2 font-medium' });
    const badge = createElement('span', {
      className: 'px-2 py-0.5 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] rounded font-bold text-[10px]',
      textContent: 'محیط آزمایشی DEMO',
    });
    const infoText = createElement('span', {
      textContent: `هویت فعال: ${this.user.name} (${getRoleLabel(this.membership.role)}) — ${this.membership.organization.name}`,
    });
    infoBox.appendChild(badge);
    infoBox.appendChild(infoText);

    const actionsBox = createElement('div', { className: 'flex items-center gap-2' });

    const switchBtn = createElement('button', {
      className: 'px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-200 rounded font-semibold text-[11px] transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--theme-accent))]',
      innerHTML: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg> تغییر نقش (۱۴ دمو)`,
    });
    switchBtn.addEventListener('click', () => this.openDemoModal());

    const resetBtn = createElement('button', {
      className: 'px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded font-semibold text-[11px] transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-red-400',
      innerHTML: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> بازنشانی داده‌ها`,
    });
    resetBtn.addEventListener('click', () => {
      if (confirm('آیا از بازنشانی کلیه داده‌های آزمایشی دمو به حالت اولیه اطمینان دارید؟')) {
        schoolStore.resetDemoData();
        alert('داده‌های دمو با موفقیت بازنشانی شدند.');
        window.location.reload();
      }
    });

    actionsBox.appendChild(switchBtn);
    actionsBox.appendChild(resetBtn);

    banner.appendChild(infoBox);
    banner.appendChild(actionsBox);

    return banner;
  }

  private openDemoModal(): void {
    clearElement(this.modalContainerEl);
    const modal = createDemoSwitcherModal(() => {
      clearElement(this.modalContainerEl);
    });
    this.modalContainerEl.appendChild(modal);
  }
}
