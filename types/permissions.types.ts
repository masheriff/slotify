// types/permissions.types.ts
import { HEALTHCARE_RESOURCES, HEALTHCARE_ACTIONS, HEALTHCARE_ROLES } from '@/lib/permissions/healthcare-permissions-constants';
import { User } from 'better-auth';
import { Organization } from '@/types/organization.types';
import { Member } from 'better-auth/plugins';

export type HealthcareResource = typeof HEALTHCARE_RESOURCES[keyof typeof HEALTHCARE_RESOURCES];
export type HealthcareAction = typeof HEALTHCARE_ACTIONS[keyof typeof HEALTHCARE_ACTIONS];
export type HealthcareRole = typeof HEALTHCARE_ROLES[keyof typeof HEALTHCARE_ROLES];

export interface PermissionCheck {
  resource: HealthcareResource;
  action: HealthcareAction;
  organizationId?: string;
  resourceId?: string;
}

export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: HealthcareRole;
  requiredPermissions?: string[];
}

export interface RolePermissions {
  [resource: string]: string[];
}

export interface PermissionContext {
  user: User;
  organization?: Organization;
  member?: Member;
}