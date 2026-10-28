/**
 * POLARIS PROSPECTIVE APPLICANT ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createApplicantOverviewPage } from './applicant-overview';
import { createApplicantRegistrationPage } from './applicant-registration';
import { createStudentPaymentsPage } from '../student/student-payments';
import { createTeacherClassesPage } from '../teacher/teacher-classes';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderApplicantSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createApplicantOverviewPage(membership);
    case 'courses':
      return createTeacherClassesPage(membership);
    case 'registration':
      return createApplicantRegistrationPage(membership);
    case 'status':
      return createApplicantOverviewPage(membership);
    case 'payments':
      return createStudentPaymentsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
