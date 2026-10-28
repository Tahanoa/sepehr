/**
 * POLARIS SECONDARY SCHOOL COUNSELOR ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createCounselorOverviewPage } from './counselor-overview';
import { createCounselorMessagesPage } from './counselor-messages';
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
      return createCounselorMessagesPage(membership);
    case 'reports':
      return createReportsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
