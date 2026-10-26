/**
 * POLARIS NAVIGATION TYPES
 * Navigation items, sidebar structure, and routing types.
 */

import { UserRole } from './common';

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  badge?: string | number;
  roles?: UserRole[];
}

export interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}
