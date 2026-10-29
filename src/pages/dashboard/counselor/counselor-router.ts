import { createMessengerPage } from '../shared/messenger-page';
/**
 * POLARIS SECONDARY SCHOOL COUNSELOR ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createCounselorOverviewPage } from './counselor-overview';
import { createStudentsPage } from '../admin/students-page';
import { createReportsPage } from '../admin/reports-page';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderCounselorSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createCounselorOverviewPage(membership);
    case 'students':
    case 'progress':
      return createStudentsPage(membership);
    case 'messages':
      return createMessengerPage(membership);
    case 'reports':
      return createReportsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
