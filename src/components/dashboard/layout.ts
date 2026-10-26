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

    this.headerContainerEl = createElement('div', { className: 'w-full shrink-0' });
    this.contentViewportEl = createElement('main', {
      id: 'dashboard-main-content',
      className: 'flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-200',
    });

    this.contentViewportEl.appendChild(this.content);

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

    this.renderSidebar();
    this.renderHeader();

    clearElement(this.contentViewportEl);
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
      }
    );

    const existingDrawer = document.getElementById('mobile-drawer-root');
    if (existingDrawer) {
      existingDrawer.remove();
    }
    drawer.id = 'mobile-drawer-root';
    this.rootEl.appendChild(drawer);
  }

  private openDemoModal(): void {
    clearElement(this.modalContainerEl);
    const modal = createDemoSwitcherModal(() => {
      clearElement(this.modalContainerEl);
    });
    this.modalContainerEl.appendChild(modal);
  }
}
