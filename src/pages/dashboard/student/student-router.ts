/**
 * POLARIS STUDENT & LEARNER ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createStudentOverviewPage } from './student-overview';
import { createStudentAssignmentsPage } from './student-assignments';
import { createStudentExamsPage } from './student-exams';
import { createStudentGradesPage } from './student-grades';
import { createStudentMaterialsPage } from './student-materials';
import { createStudentPaymentsPage } from './student-payments';
import { createTeacherClassesPage } from '../teacher/teacher-classes';
import { createTimetablePage } from '../admin/timetable-page';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderStudentSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createStudentOverviewPage(membership);
    case 'classes':
      return createTeacherClassesPage(membership);
    case 'assignments':
      return createStudentAssignmentsPage(membership);
    case 'exams':
      return createStudentExamsPage(membership);
    case 'grades':
      return createStudentGradesPage(membership);
    case 'materials':
      return createStudentMaterialsPage(membership);
    case 'schedule':
      return createTimetablePage(membership);
    case 'payments':
      return createStudentPaymentsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
