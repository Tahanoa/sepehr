/**
 * POLARIS ORGANIZATION TYPES
 * Strongly typed organization classification and metadata structures.
 */

export type OrganizationType = 'elementary_school' | 'secondary_school' | 'general_school' | 'independent_institute';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  code: string;
  logoUrl?: string;
  description?: string;
  academicYear?: string;
}
