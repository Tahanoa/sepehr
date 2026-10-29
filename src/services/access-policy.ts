/**
 * POLARIS ACCESS POLICY & AUTHORIZATION ENGINE
 * Centralized authorization policy separating identity, organization membership,
 * role authorizations, and resource permissions.
 */

import { Role, Permission, OrganizationMembership, User } from '../types/auth';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  school_admin: [
    'view_students',
    'manage_students',
    'view_teachers',
    'manage_teachers',
    'view_classes',
    'manage_classes',
    'view_attendance',
    'record_attendance',
    'view_grades',
    'manage_grades',
    'view_reports',
    'manage_reports',
    'view_announcements',
    'manage_announcements',
    'view_messages',
    'send_messages',
    'manage_settings',
  ],
  teacher: [
    'view_students',
    'view_teachers',
    'view_classes',
    'view_attendance',
    'record_attendance',
    'view_assignments',
    'manage_assignments',
    'view_exams',
    'manage_exams',
    'view_grades',
    'manage_grades',
    'view_announcements',
    'view_messages',
    'send_messages',
  ],
  student: [
    'view_classes',
    'view_attendance',
    'view_assignments',
    'view_exams',
    'view_grades',
    'view_announcements',
    'view_messages',
    'send_messages',
    'view_schedule',
  ],
  parent: [
    'view_children',
    'view_attendance',
    'view_grades',
    'view_announcements',
    'view_messages',
    'send_messages',
  ],
  counselor: [
    'view_students',
    'view_progress',
    'view_attendance',
    'view_grades',
    'view_reports',
    'view_announcements',
    'view_messages',
    'send_messages',
  ],
  institute_admin: [
    'view_students',
    'manage_students',
    'view_instructors',
    'manage_instructors',
    'view_courses',
    'manage_courses',
    'view_classes',
    'manage_classes',
    'view_attendance',
    'record_attendance',
    'view_grades',
    'manage_grades',
    'view_reports',
    'manage_reports',
    'view_payments',
    'manage_payments',
    'view_announcements',
    'manage_announcements',
    'view_messages',
    'send_messages',
    'manage_settings',
  ],
  instructor: [
    'view_students',
    'view_instructors',
    'view_courses',
    'view_classes',
    'view_attendance',
    'record_attendance',
    'view_assignments',
    'manage_assignments',
    'view_exams',
    'manage_exams',
    'view_grades',
    'manage_grades',
    'view_announcements',
    'view_messages',
    'send_messages',
    'view_schedule',
  ],
  applicant: [
    'view_courses',
    'view_payments',
  ],
};

export class AccessPolicy {
  /**
   * Retrieves permissions granted to a given role.
   */
  public static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Checks if an organization membership has a specific permission.
   */
  public static hasPermission(
    membership: OrganizationMembership | null,
    permission?: Permission
  ): boolean {
    if (!permission) return true;
    if (!membership || membership.status !== 'active') return false;

    const permissions = this.getRolePermissions(membership.role);
    return permissions.includes(permission);
  }

  /**
   * Checks if a user has access to a specific organization ID.
   */
  public static canAccessOrganization(user: User | null, organizationId: string): boolean {
    if (!user) return false;
    return user.memberships.some(
      (m) => m.organizationId === organizationId && m.status === 'active'
    );
  }

  /**
   * Returns true if the user is a school or institute administrator with full management rights.
   */
  public static canManageOrgRecords(membership: OrganizationMembership | null): boolean {
    if (!membership || membership.status !== 'active') return false;
    return membership.role === 'school_admin' || membership.role === 'institute_admin';
  }

  /**
   * Returns true if the user is allowed to edit records for a given class.
   */
  public static canModifyClassData(
    membership: OrganizationMembership | null,
    classId: string,
    assignedClassIds: string[] = []
  ): boolean {
    if (!membership || membership.status !== 'active') return false;
    if (this.canManageOrgRecords(membership)) return true;
    if (membership.role === 'teacher' || membership.role === 'instructor') {
      return assignedClassIds.includes(classId);
    }
    return false;
  }

  /**
   * Checks whether a given role can access a named section key.
   */
  public static canAccessSectionKey(
    membership: OrganizationMembership | null,
    sectionKey: string
  ): boolean {
    if (!membership || membership.status !== 'active') return false;

    // Overview is available to all active memberships
    if (sectionKey === 'overview') return true;

    switch (membership.role) {
      case 'school_admin':
        return [
          'overview',
          'students',
          'teachers',
          'classes',
          'attendance',
          'schedule',
          'exams',
          'exam-builder',
          'messages',
          'grades',
          'counseling',
          'announcements',
          'reports',
          'payments',
          'settings',
        ].includes(sectionKey);

      case 'teacher':
        return [
          'overview',
          'classes',
          'students',
          'attendance',
          'assignments',
          'exams',
          'exam-builder',
          'messages',
          'grades',
          'materials',
          'schedule',
        ].includes(sectionKey);

      case 'student':
        return [
          'messages',
          'overview',
          'classes',
          'assignments',
          'exams',
          'grades',
          'materials',
          'schedule',
        ].includes(sectionKey);

      case 'parent':
        return [
          'overview',
          'children',
          'attendance',
          'grades',
          'announcements',
          'messages',
          'schedule',
          'payments',
        ].includes(sectionKey);

      case 'counselor':
        return [
          'overview',
          'students',
          'progress',
          'messages',
          'reports',
        ].includes(sectionKey);

      case 'institute_admin':
        return [
          'overview',
          'students',
          'instructors',
          'courses',
          'attendance',
          'schedule',
          'exams',
          'exam-builder',
          'messages',
          'grades',
          'payments',
          'settings',
        ].includes(sectionKey);

      case 'instructor':
        return [
          'overview',
          'courses',
          'students',
          'schedule',
          'attendance',
          'assignments',
          'exams',
          'exam-builder',
          'messages',
          'grades',
          'materials',
        ].includes(sectionKey);

      case 'applicant':
        return [
          'overview',
          'courses',
          'registration',
          'status',
          'payments',
        ].includes(sectionKey);

      default:
        return false;
    }
  }
}
