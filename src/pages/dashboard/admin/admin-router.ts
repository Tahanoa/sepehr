/**
 * POLARIS SCHOOL ADMINISTRATOR ROUTE DISPATCHER
 * Routes school_admin section requests to the appropriate page component
 * based on sectionKey and organization type (elementary, secondary, general).
 */

import { OrganizationMembership } from '../../../types/auth';
import { createAdminOverviewPage } from './overview-page';
import { createStudentsPage } from './students-page';
import { createClassesPage } from './classes-page';
import { createTeachersPage } from './teachers-page';
import { createAttendancePage } from './attendance-page';
import { createTimetablePage } from './timetable-page';
import { createExamsPage } from './exams-page';
import { createGradesPage } from './grades-page';
import { createCounselingPage } from './counseling-page';
import { createAnnouncementsPage } from './announcements-page';
import { createReportsPage } from './reports-page';
import { createSettingsPage } from './settings-page';
import { createDashboardNotFoundPage } from '../../../components/dashboard/route-pages';

export function renderSchoolAdminSection(sectionKey: string, membership: OrganizationMembership): HTMLElement {
  const orgId = membership.organizationId;

  switch (sectionKey) {
    case 'overview':
      return createAdminOverviewPage(membership);
    case 'students':
      return createStudentsPage(membership);
    case 'classes':
      return createClassesPage(membership);
    case 'teachers':
      return createTeachersPage(membership);
    case 'attendance':
      return createAttendancePage(membership);
    case 'schedule':
      return createTimetablePage(membership);
    case 'exams':
      return createExamsPage(membership);
    case 'grades':
      return createGradesPage(membership);
    case 'counseling':
      return createCounselingPage(membership);
    case 'announcements':
      return createAnnouncementsPage(membership);
    case 'reports':
      return createReportsPage(membership);
    case 'settings':
      return createSettingsPage(membership);
    default:
      return createDashboardNotFoundPage(orgId);
  }
}
