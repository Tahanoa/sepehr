/**
 * POLARIS TEACHER & INSTRUCTOR ROUTE DISPATCHER
 */

import { OrganizationMembership } from '../../../types/auth';
import { createTeacherOverviewPage } from './teacher-overview';
import { createTeacherClassesPage } from './teacher-classes';
import { createTeacherAssignmentsPage } from './teacher-assignments';
import { createTeacherExamsPage } from './teacher-exams';
import { createExamBuilderPage } from './exam-builder-page';
import { createTeacherGradesPage } from './teacher-grades';
import { createTeacherMaterialsPage } from './teacher-materials';
import { createAttendancePage } from '../admin/attendance-page';
import { createTimetablePage } from '../admin/timetable-page';
import { createStudentsPage } from '../admin/students-page';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderTeacherSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createTeacherOverviewPage(membership);
    case 'classes':
    case 'courses':
      return createTeacherClassesPage(membership);
    case 'students':
      return createStudentsPage(membership);
    case 'attendance':
      return createAttendancePage(membership);
    case 'assignments':
      return createTeacherAssignmentsPage(membership);
    case 'exams':
      return createTeacherExamsPage(membership);
    case 'exam-builder':
      return createExamBuilderPage(membership);
    case 'grades':
      return createTeacherGradesPage(membership);
    case 'materials':
      return createTeacherMaterialsPage(membership);
    case 'schedule':
      return createTimetablePage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
