import { createMessengerPage } from '../shared/messenger-page';
/**
 * POLARIS SECONDARY SCHOOL COUNSELOR ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createCounselorOverviewPage } from './counselor-overview';
import { createCounselorStudents,createCounselorReports } from './counselor-students';

import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderCounselorSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createCounselorOverviewPage(membership);
    case 'students':
    case 'progress':
      return createCounselorStudents(membership);
    case 'messages':
      return createMessengerPage(membership);
    case 'reports':
      return createCounselorReports(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
