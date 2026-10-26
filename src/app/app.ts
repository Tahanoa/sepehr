/**
 * POLARIS APPLICATION INITIALIZER FOR PUBLIC & PROTECTED ROUTES
 */

import { Router } from './router';
import { createPublicHeader } from '../components/public/public-header';
import { createPublicFooter } from '../components/public/public-footer';
import { createLandingPage } from '../pages/public/home-page';
import { createPlansOverviewPage, createPlanDetailPage } from '../pages/public/plans-pages';
import { createAboutPage, createPrivacyPage, createTermsPage, createNotFoundPage } from '../pages/public/info-pages';
import { createContactPage, createLoginPage, createRegisterPage, createForgotPasswordPage } from '../pages/public/auth-forms';
import { createElement, clearElement } from '../utils/dom';

export function initializeApp(): { getRootElement: () => HTMLElement } {
  const root = createElement('div', { className: 'min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans' });

  const headerContainer = createElement('div', { id: 'public-header-container' });
  const contentContainer = createElement('main', { id: 'public-content-container', className: 'flex-1' });
  const footerContainer = createElement('div', { id: 'public-footer-container' });

  root.appendChild(headerContainer);
  root.appendChild(contentContainer);
  root.appendChild(footerContainer);

  const router = new Router();

  // Register Public Routes
  router.addRoute('/', () => createLandingPage());
  router.addRoute('/plans', () => createPlansOverviewPage());
  router.addRoute('/plans/elementary', () => createPlanDetailPage('elementary'));
  router.addRoute('/plans/secondary', () => createPlanDetailPage('secondary'));
  router.addRoute('/plans/institute', () => createPlanDetailPage('institute'));
  router.addRoute('/about', () => createAboutPage());
  router.addRoute('/contact', () => createContactPage());
  router.addRoute('/login', () => createLoginPage());
  router.addRoute('/register', (_, queryParams) => createRegisterPage(queryParams?.plan));
  router.addRoute('/forgot-password', () => createForgotPasswordPage());
  router.addRoute('/privacy', () => createPrivacyPage());
  router.addRoute('/terms', () => createTermsPage());

  router.setNotFoundHandler(() => createNotFoundPage());

  router.onRoute((path, content) => {
    // Update Header
    clearElement(headerContainer);
    headerContainer.appendChild(createPublicHeader(path));

    // Update Content
    clearElement(contentContainer);
    contentContainer.appendChild(content);

    // Update Footer
    clearElement(footerContainer);
    footerContainer.appendChild(createPublicFooter());

    // Scroll to top
    window.scrollTo(0, 0);
  });

  window.addEventListener('polaris-navigate', ((e: CustomEvent) => {
    if (e.detail) {
      router.navigate(e.detail);
    }
  }) as EventListener);

  // Initial routing
  router.handleCurrentUrl();

  return {
    getRootElement: () => root,
  };
}
