/**
 * POLARIS AUTHENTICATION & AUTHORIZATION TYPES
 * User models, organization memberships, roles, permissions, and sessions.
 */

import { Organization } from './organization';

export type Role =
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'counselor'
  | 'institute_admin'
  | 'instructor'
  | 'applicant';

export type Permission =
  | 'view_students'
  | 'manage_students'
  | 'view_teachers'
  | 'manage_teachers'
  | 'view_instructors'
  | 'manage_instructors'
  | 'view_classes'
  | 'manage_classes'
  | 'view_courses'
  | 'manage_courses'
  | 'view_attendance'
  | 'record_attendance'
  | 'view_assignments'
  | 'manage_assignments'
  | 'view_exams'
  | 'manage_exams'
  | 'view_grades'
  | 'manage_grades'
  | 'view_reports'
  | 'manage_reports'
  | 'view_announcements'
  | 'manage_announcements'
  | 'view_messages'
  | 'send_messages'
  | 'view_children'
  | 'view_progress'
  | 'view_payments'
  | 'manage_payments'
  | 'view_schedule'
  | 'manage_settings';

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  organization: Organization;
  role: Role;
  status: 'active' | 'inactive';
  title?: string;
  department?: string;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  memberships: OrganizationMembership[];
}

export interface AuthSession {
  user: User;
  activeMembershipId: string;
  token?: string;
  isDemoSession?: boolean;
}
