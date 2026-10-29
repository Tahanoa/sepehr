import { createMessengerPage } from '../shared/messenger-page';
/**
 * POLARIS PARENT ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createParentOverviewPage } from './parent-overview';
import { createParentAttendancePage } from './parent-attendance';
import { createReportCardsPage } from '../shared/report-cards-page';
import { createStudentPaymentsPage } from '../student/student-payments';
import { createAnnouncementsPage } from '../admin/announcements-page';
import { createStudentsPage } from '../admin/students-page';
import { createTimetablePage } from '../admin/timetable-page';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderParentSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createParentOverviewPage(membership);
    case 'children':
      return createStudentsPage(membership);
    case 'attendance':
      return createParentAttendancePage(membership);
    case 'grades':
      return createReportCardsPage(membership);
    case 'announcements':
      return createAnnouncementsPage(membership);
    case 'messages':
      return createMessengerPage(membership);
    case 'schedule':
      return createTimetablePage(membership);
    case 'payments':
      return createStudentPaymentsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
