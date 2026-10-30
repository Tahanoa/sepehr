/**
 * POLARIS PROSPECTIVE APPLICANT ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createApplicantOverviewPage } from './applicant-overview';
import { createApplicantRegistrationPage } from './applicant-registration';
import { createApplicantCourses, createApplicantPayments } from './applicant-courses';

import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderApplicantSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createApplicantOverviewPage(membership);
    case 'courses':
      return createApplicantCourses(membership);
    case 'registration':
      return createApplicantRegistrationPage(membership);
    case 'status':
      return createApplicantOverviewPage(membership);
    case 'payments':
      return createApplicantPayments(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
