/**
 * POLARIS MAIN APPLICATION INITIALIZER
 * Manages public website views and authenticated dashboard shell views with route guards and access policy.
 */

import { Router } from './router';
import { authService } from '../services/auth-service';
import { AccessPolicy } from '../services/access-policy';
import { getNavigationForRoleAndOrg, getDashboardSectionTitles } from '../config/navigation-config';
import { DashboardLayout } from '../components/dashboard/layout';
import { getRoleLabel } from '../components/dashboard/icons';
import { renderSchoolAdminSection } from '../pages/dashboard/admin/admin-router';
import { renderTeacherSection } from '../pages/dashboard/teacher/teacher-router';
import { renderStudentSection } from '../pages/dashboard/student/student-router';
import { renderParentSection } from '../pages/dashboard/parent/parent-router';
import { renderCounselorSection } from '../pages/dashboard/counselor/counselor-router';
import { renderApplicantSection } from '../pages/dashboard/applicant/applicant-router';
import {
  createFeaturePlaceholderPage,
  createAccessDeniedPage,
  createDashboardNotFoundPage,
} from '../components/dashboard/route-pages';

// Public Components & Pages
import { createPublicHeader } from '../components/public/public-header';
import { createPublicFooter } from '../components/public/public-footer';
import { createLandingPage } from '../pages/public/home-page';
import { createPlansOverviewPage, createPlanDetailPage } from '../pages/public/plans-pages';
import { createAboutPage, createPrivacyPage, createTermsPage, createNotFoundPage } from '../pages/public/info-pages';
import { createContactPage, createLoginPage, createRegisterPage, createForgotPasswordPage } from '../pages/public/auth-forms';
import { createElement, clearElement } from '../utils/dom';

export function initializeApp(): { getRootElement: () => HTMLElement } {
  const root = createElement('div', { className: 'min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans' });

  // Containers for Public Layout
  const publicHeaderContainer = createElement('div', { id: 'public-header-container' });
  const publicContentContainer = createElement('main', { id: 'public-content-container', className: 'flex-1' });
  const publicFooterContainer = createElement('div', { id: 'public-footer-container' });

  const publicLayoutWrapper = createElement('div', { className: 'flex-1 flex flex-col min-h-screen' });
  publicLayoutWrapper.appendChild(publicHeaderContainer);
  publicLayoutWrapper.appendChild(publicContentContainer);
  publicLayoutWrapper.appendChild(publicFooterContainer);

  // Container for Dashboard Layout
  const dashboardLayoutContainer = createElement('div', { id: 'dashboard-layout-container', className: 'min-h-screen w-full' });

  root.appendChild(publicLayoutWrapper);
  root.appendChild(dashboardLayoutContainer);

  const router = new Router();
  let currentDashboardLayout: DashboardLayout | null = null;

  // Render Mode Switcher: Public vs Dashboard Shell
  const showPublicLayout = (path: string, content: HTMLElement) => {
    dashboardLayoutContainer.style.display = 'none';
    publicLayoutWrapper.style.display = 'flex';

    clearElement(publicHeaderContainer);
    publicHeaderContainer.appendChild(createPublicHeader(path));

    clearElement(publicContentContainer);
    publicContentContainer.appendChild(content);

    clearElement(publicFooterContainer);
    publicFooterContainer.appendChild(createPublicFooter());

    window.scrollTo(0, 0);
  };

  const showDashboardLayout = (organizationId: string, sectionKey: string) => {
    publicLayoutWrapper.style.display = 'none';
    dashboardLayoutContainer.style.display = 'block';

    const user = authService.getCurrentUser();

    // 1. Unauthenticated or session missing
    if (!user) {
      router.navigate('/login');
      return;
    }

    // 2. Check if user has access to target organization
    if (!AccessPolicy.canAccessOrganization(user, organizationId)) {
      const activeMem = authService.getActiveMembership();
      const fallbackOrgId = activeMem ? activeMem.organizationId : organizationId;
      const content = createAccessDeniedPage(fallbackOrgId, activeMem?.role);
      renderDashboardView(organizationId, 'دسترسی غیرمجاز', content);
      return;
    }

    // 3. Ensure active membership matches target organization
    let membership = authService.getActiveMembership();
    if (!membership || membership.organizationId !== organizationId) {
      const targetMembership = user.memberships.find((m) => m.organizationId === organizationId && m.status === 'active');
      if (targetMembership) {
        authService.setActiveMembership(targetMembership.id);
        membership = targetMembership;
      }
    }

    if (!membership) {
      const content = createAccessDeniedPage(organizationId);
      renderDashboardView(organizationId, 'دسترسی غیرمجاز', content);
      return;
    }

    // 4. Validate section authorization
    const isSectionAllowed = AccessPolicy.canAccessSectionKey(membership, sectionKey);

    if (!isSectionAllowed) {
      const content = createAccessDeniedPage(organizationId, membership.role);
      renderDashboardView(organizationId, 'عدم دسترسی کافی', content);
      return;
    }

    // 5. Generate Section View
    const sectionTitles = getDashboardSectionTitles();
    const sectionTitle = sectionTitles[sectionKey] || 'بخش سیستم';

    let viewContent: HTMLElement;

    if (membership.role === 'school_admin' || membership.role === 'institute_admin') {
      viewContent = renderSchoolAdminSection(sectionKey, membership);
    } else if (membership.role === 'teacher' || membership.role === 'instructor') {
      viewContent = renderTeacherSection(sectionKey, membership);
    } else if (membership.role === 'student') {
      viewContent = renderStudentSection(sectionKey, membership);
    } else if (membership.role === 'parent') {
      viewContent = renderParentSection(sectionKey, membership);
    } else if (membership.role === 'counselor') {
      viewContent = renderCounselorSection(sectionKey, membership);
    } else if (membership.role === 'applicant') {
      viewContent = renderApplicantSection(sectionKey, membership);
    } else {
      // Intentional feature placeholder for unfinished role feature routes
      viewContent = createFeaturePlaceholderPage({
        sectionTitle,
        sectionKey,
        roleTitle: getRoleLabel(membership.role),
        organizationId,
      });
    }

    renderDashboardView(organizationId, sectionTitle, viewContent);
  };

  const renderDashboardView = (organizationId: string, pageTitle: string, content: HTMLElement) => {
    const user = authService.getCurrentUser()!;
    const membership = authService.getActiveMembership()!;
    const navItems = getNavigationForRoleAndOrg(membership.role, membership.organization.type, organizationId);
    const currentPath = window.location.pathname;

    if (!currentDashboardLayout) {
      currentDashboardLayout = new DashboardLayout({
        user,
        membership,
        navItems,
        currentPath,
        pageTitle,
        content,
        onNavigate: (path) => router.navigate(path),
      });

      clearElement(dashboardLayoutContainer);
      dashboardLayoutContainer.appendChild(currentDashboardLayout.getRootElement());
    } else {
      currentDashboardLayout.updateState(user, membership, navItems, currentPath, pageTitle, content);
    }

    window.scrollTo(0, 0);
  };

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

  // Register Dashboard Routes
  router.addRoute('/app', () => {
    const activeMem = authService.getActiveMembership();
    if (activeMem) {
      router.navigate(`/app/${activeMem.organizationId}/overview`, false);
    } else {
      router.navigate('/login');
    }
    return createElement('div');
  });

  router.addRoute('/app/:organizationId', (params) => {
    const orgId = params?.organizationId;
    if (orgId) {
      router.navigate(`/app/${orgId}/overview`, false);
    }
    return createElement('div');
  });

  router.addRoute('/app/:organizationId/:section', (params) => {
    const orgId = params?.organizationId;
    const section = params?.section || 'overview';
    if (orgId) {
      showDashboardLayout(orgId, section);
    }
    return createElement('div');
  });

  // Not found fallback
  router.setNotFoundHandler(() => {
    if (window.location.pathname.startsWith('/app')) {
      const activeMem = authService.getActiveMembership();
      const orgId = activeMem ? activeMem.organizationId : 'org-101';
      const notFoundPage = createDashboardNotFoundPage(orgId);
      renderDashboardView(orgId, 'صفحه یافت نشد', notFoundPage);
      return createElement('div');
    } else {
      return createNotFoundPage();
    }
  });

  router.onRoute((path, content) => {
    if (!path.startsWith('/app')) {
      showPublicLayout(path, content);
    }
  });

  // Global navigation listener
  window.addEventListener('polaris-navigate', ((e: CustomEvent) => {
    if (e.detail) {
      router.navigate(e.detail);
    }
  }) as EventListener);

  // Subscribe to auth state changes
  authService.onAuthStateChanged((session) => {
    const path = window.location.pathname;
    if (path.startsWith('/app')) {
      if (session && session.user) {
        const activeMem = authService.getActiveMembership();
        if (activeMem) {
          const sectionMatch = path.match(/\/app\/[^/]+\/([^/]+)/);
          const section = sectionMatch ? sectionMatch[1] : 'overview';
          showDashboardLayout(activeMem.organizationId, section || 'overview');
        }
      } else {
        router.navigate('/login');
      }
    }
  });

  // Handle initial routing
  router.handleCurrentUrl();

  return {
    getRootElement: () => root,
  };
}
