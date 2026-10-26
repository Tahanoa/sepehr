/**
 * POLARIS APPLICATION SHELL COMPONENT
 * Main layout controller connecting responsive sidebar, top header, content viewport, and backdrop.
 */

import { createElement, clearElement } from '../utils/dom';
import { createSidebar } from './sidebar';
import { createHeader } from './header';
import { mainNavigation, currentUser } from '../data/mock-data';

export class AppShell {
  private containerEl: HTMLElement;
  private sidebarEl: HTMLElement;
  private mainWrapperEl: HTMLElement;
  private headerContainerEl: HTMLElement;
  private contentContainerEl: HTMLElement;
  private backdropEl: HTMLElement;

  private activePath: string = '/';
  private onNavigateCallback?: (path: string) => void;

  constructor() {
    this.containerEl = createElement('div', { className: 'polaris-app-shell' });

    // Main Content Wrapper (Header + Content Body)
    this.mainWrapperEl = createElement('div', { className: 'polaris-main-wrapper' });
    this.headerContainerEl = createElement('div', { className: 'polaris-header-container' });
    this.contentContainerEl = createElement('main', { className: 'polaris-content', id: 'main-content' });

    this.mainWrapperEl.appendChild(this.headerContainerEl);
    this.mainWrapperEl.appendChild(this.contentContainerEl);

    // Sidebar & Backdrop
    this.sidebarEl = createSidebar(mainNavigation, this.activePath, (path) => this.handleNavigate(path));

    this.backdropEl = createElement('div', { className: 'polaris-sidebar-backdrop' });
    this.backdropEl.addEventListener('click', () => this.closeMobileSidebar());

    this.containerEl.appendChild(this.sidebarEl);
    this.containerEl.appendChild(this.backdropEl);
    this.containerEl.appendChild(this.mainWrapperEl);

    this.updateHeader('پیش‌خوان اصلی');
  }

  public getRootElement(): HTMLElement {
    return this.containerEl;
  }

  public setOnNavigate(callback: (path: string) => void): void {
    this.onNavigateCallback = callback;
  }

  public setContent(content: HTMLElement, pageTitle: string): void {
    clearElement(this.contentContainerEl);
    this.contentContainerEl.appendChild(content);
    this.updateHeader(pageTitle);
  }

  public setActivePath(path: string): void {
    this.activePath = path;
    // Refresh sidebar active status
    const newSidebar = createSidebar(mainNavigation, this.activePath, (p) => this.handleNavigate(p));
    this.containerEl.replaceChild(newSidebar, this.sidebarEl);
    this.sidebarEl = newSidebar;
  }

  private updateHeader(pageTitle: string): void {
    clearElement(this.headerContainerEl);

    const breadcrumbs = [
      { title: 'سامانه پولاریس', path: '/' },
      { title: pageTitle },
    ];

    const header = createHeader({
      user: currentUser,
      breadcrumbs,
      onMobileToggle: () => this.toggleMobileSidebar(),
    });

    this.headerContainerEl.appendChild(header);
  }

  private toggleMobileSidebar(): void {
    this.sidebarEl.classList.toggle('polaris-sidebar--mobile-open');
    this.backdropEl.classList.toggle('polaris-sidebar-backdrop--visible');
  }

  private closeMobileSidebar(): void {
    this.sidebarEl.classList.remove('polaris-sidebar--mobile-open');
    this.backdropEl.classList.remove('polaris-sidebar-backdrop--visible');
  }

  private handleNavigate(path: string): void {
    this.closeMobileSidebar();
    if (this.onNavigateCallback) {
      this.onNavigateCallback(path);
    }
  }
}
