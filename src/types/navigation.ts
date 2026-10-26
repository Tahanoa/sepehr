/**
 * POLARIS NAVIGATION TYPES
 * Strongly typed navigation configurations and route metadata.
 */

import { Role, Permission } from './auth';
import { OrganizationType } from './organization';

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  sectionKey?: string;
  icon: string;
  badge?: string | number;
  roles?: Role[];
  allowedOrgTypes?: OrganizationType[];
  requiredPermission?: Permission;
}

export interface NavigationGroup {
  groupTitle?: string;
  items: NavigationItem[];
}

export interface DashboardRouteMetadata {
  title: string;
  description?: string;
  sectionKey: string;
  requiredPermission?: Permission;
  roles?: Role[];
  allowedOrgTypes?: OrganizationType[];
}

// Backward compatibility type aliases
export type NavItem = NavigationItem;
export type NavGroup = NavigationGroup;
