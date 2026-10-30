import { createMessengerPage } from '../shared/messenger-page';
/**
 * POLARIS PARENT ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createParentOverviewPage } from './parent-overview';
import { createParentAttendancePage } from './parent-attendance';
import { createReportCardsPage } from '../shared/report-cards-page';
import { createStudentPaymentsPage } from '../student/student-payments';
import { createFamilyAnnouncements } from '../shared/family-announcements';
import { createParentChildrenPage } from './parent-children';
import { createStudentSchedule } from '../student/student-schedule';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderParentSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createParentOverviewPage(membership);
    case 'children':
      return createParentChildrenPage(membership);
    case 'attendance':
      return createParentAttendancePage(membership);
    case 'grades':
      return createReportCardsPage(membership);
    case 'announcements':
      return createFamilyAnnouncements(membership);
    case 'messages':
      return createMessengerPage(membership);
    case 'schedule':
      return createStudentSchedule(membership);
    case 'payments':
      return createStudentPaymentsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
