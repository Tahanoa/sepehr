import { createMessengerPage } from '../shared/messenger-page';
/**
 * POLARIS STUDENT & LEARNER ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createStudentOverviewPage } from './student-overview';
import { createStudentAssignmentsPage } from './student-assignments';
import { createStudentExamsPage } from './student-exams';
import { createReportCardsPage } from '../shared/report-cards-page';
import { createStudentMaterialsPage } from './student-materials';
import { createStudentPaymentsPage } from './student-payments';
import { createStudentSchedule } from './student-schedule';

import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderStudentSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'messages': return createMessengerPage(membership);
    case 'overview':
      return createStudentOverviewPage(membership);
    case 'classes':
      return createStudentSchedule(membership);
    case 'assignments':
      return createStudentAssignmentsPage(membership);
    case 'exams':
      return createStudentExamsPage(membership);
    case 'grades':
      return createReportCardsPage(membership);
    case 'materials':
      return createStudentMaterialsPage(membership);
    case 'schedule':
      return createStudentSchedule(membership);
    case 'payments':
      return createStudentPaymentsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
