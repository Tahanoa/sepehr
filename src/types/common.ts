/**
 * POLARIS COMMON TYPES
 * Domain types for metrics, table columns, status badges, and user UI representations.
 */

import { Role } from './auth';

export type UserRole = Role | 'admin' | 'teacher' | 'student' | 'parent' | 'counselor' | 'institute';

export interface UserProfile {
  id: string;
  name: string;
  role: Role | UserRole;
  roleLabel: string;
  avatarUrl?: string;
  email: string;
}

export interface StatMetric {
  id: string;
  title: string;
  value: string | number;
  changePercent?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  periodLabel?: string;
  iconName?: string;
}

export type StatusType = 'active' | 'pending' | 'inactive' | 'suspended' | 'completed';

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => string | HTMLElement;
  sortable?: boolean;
  align?: 'right' | 'center' | 'left';
  width?: string;
}

export interface StudentRecord {
  id: string;
  studentCode: string;
  fullName: string;
  gradeLevel: string;
  courseName: string;
  gpa: number;
  status: StatusType;
  enrollmentDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read?: boolean;
}
