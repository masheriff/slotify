// lib/permissions/healthcare-permissions.ts - Comprehensive role-based permissions system
import { HEALTHCARE_ROLES, HEALTHCARE_RESOURCES } from './healthcare-permissions-constants';

/**
 * Define comprehensive permissions for each role based on your requirements
 */
export const ROLE_PERMISSIONS = {
  // 5AM Corp (Admin Organization) Roles
  [HEALTHCARE_ROLES.SYSTEM_ADMIN]: {
    // Super Admins - Full access to everything
    organizations: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete', 'ban', 'impersonate'],
    members: ['create', 'read', 'update', 'delete'],
    invitations: ['create', 'read', 'cancel'],
    sessions: ['list', 'revoke', 'delete'],
    
    // Full access to all healthcare resources across all organizations
    [HEALTHCARE_RESOURCES.PATIENT]: ['create', 'read', 'update', 'delete', 'view_phi', 'edit_phi', 'export_phi'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['create', 'read', 'update', 'delete', 'schedule_appointment', 'reschedule_appointment', 'cancel_appointment'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['create', 'read', 'update', 'delete', 'check_in_patient', 'start_procedure', 'complete_procedure'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['create', 'read', 'update', 'delete', 'assign_device', 'track_device', 'maintain_device'],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['create', 'read', 'update', 'delete', 'assign_interpretation', 'complete_interpretation'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.AUDIT_LOGS]: ['view_audit_logs', 'export_audit_logs'],
  },

  [HEALTHCARE_ROLES.FIVE_AM_ADMIN]: {
    // 5AM Admins - Manage users in their org + all client org data
    organizations: ['read', 'update'], // Can't create/delete orgs
    users: ['create', 'read', 'update', 'ban'], // Can't delete users or impersonate
    members: ['create', 'read', 'update', 'delete'],
    invitations: ['create', 'read', 'cancel'],
    sessions: ['list', 'revoke'],
    
    // Full access to all healthcare resources across all client organizations
    [HEALTHCARE_RESOURCES.PATIENT]: ['create', 'read', 'update', 'delete', 'view_phi', 'edit_phi'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['create', 'read', 'update', 'delete', 'schedule_appointment', 'reschedule_appointment', 'cancel_appointment'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['create', 'read', 'update', 'delete', 'check_in_patient', 'start_procedure', 'complete_procedure'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['create', 'read', 'update', 'delete', 'assign_device', 'track_device', 'maintain_device'],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['read'], // Can view but not manage interpretations
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['create', 'read', 'update', 'delete'],
    [HEALTHCARE_RESOURCES.AUDIT_LOGS]: ['view_audit_logs'],
  },

  [HEALTHCARE_ROLES.FIVE_AM_AGENT]: {
    // 5AM Agents - Limited to assigned client organizations only
    organizations: ['read'], // Can only view assigned orgs
    users: ['read'], // Can view users in assigned orgs
    members: ['read'],
    invitations: ['read'],
    sessions: ['list'],
    
    // Limited access to healthcare resources (only assigned client orgs)
    [HEALTHCARE_RESOURCES.PATIENT]: ['create', 'read', 'update', 'view_phi', 'edit_phi'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['create', 'read', 'update', 'schedule_appointment', 'reschedule_appointment', 'cancel_appointment'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['create', 'read', 'update', 'check_in_patient', 'start_procedure', 'complete_procedure'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['create', 'read', 'update', 'assign_device', 'track_device'],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['read'], // Can view interpretations
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['create', 'read', 'update'],
  },

  // Client Organization Roles
  [HEALTHCARE_ROLES.CLIENT_ADMIN]: {
    // Client Admins - Full access within their organization only
    organizations: ['read', 'update'], // Can only manage their own org
    users: ['create', 'read', 'update'], // Can manage users in their org
    members: ['create', 'read', 'update', 'delete'],
    invitations: ['create', 'read', 'cancel'],
    sessions: ['list', 'revoke'],
    
    // Full access to healthcare resources within their organization
    [HEALTHCARE_RESOURCES.PATIENT]: ['create', 'read', 'update', 'view_phi', 'edit_phi'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['read'], // Can view appointments
    [HEALTHCARE_RESOURCES.BOOKING]: ['create', 'read', 'update', 'check_in_patient'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['create', 'read', 'update', 'assign_device', 'track_device'],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['create', 'read', 'update'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['create', 'read', 'update'],
  },

  [HEALTHCARE_ROLES.FRONT_DESK]: {
    // Front Desk - Limited to their procedure location
    organizations: ['read'], // Can view their org
    users: ['read'], // Can view users
    
    // Limited healthcare access
    [HEALTHCARE_RESOURCES.PATIENT]: ['read', 'view_phi'], // View patient info
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['read'], // View appointments and convert to bookings
    [HEALTHCARE_RESOURCES.BOOKING]: ['create', 'read', 'update', 'check_in_patient'], // Manage bookings
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['read'], // View and assign technicians
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['create'], // Assign interpretations
  },

  [HEALTHCARE_ROLES.TECHNICIAN]: {
    // Technicians - Only assigned bookings
    organizations: ['read'],
    
    // Very limited access - only their assigned work
    [HEALTHCARE_RESOURCES.PATIENT]: ['read', 'view_phi'], // View patient info for assigned procedures
    [HEALTHCARE_RESOURCES.BOOKING]: ['read', 'update', 'start_procedure', 'complete_procedure'], // Manage assigned bookings
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['read', 'assign_device'], // Assign devices if needed
  },

  [HEALTHCARE_ROLES.INTERPRETING_DOCTOR]: {
    // Interpreting Doctors - Only assigned interpretations
    organizations: ['read'],
    
    // Limited to interpretation work
    [HEALTHCARE_RESOURCES.PATIENT]: ['read', 'view_phi'], // View patient info for interpretations
    [HEALTHCARE_RESOURCES.BOOKING]: ['read'], // View booking details
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['read', 'update', 'complete_interpretation'], // Manage interpretations
  },
} as const;

/**
 * Check if a role has permission for a specific action on a resource
 */
export function hasPermission(
  userRole: string,
  resource: string,
  action: string
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource as keyof typeof rolePermissions];
  if (!resourcePermissions) return false;

  return (resourcePermissions as unknown as string[]).includes(action);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: string) {
  return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || {};
}

/**
 * Check if user can access organization based on role and organization type
 */
export function canAccessOrganization(
  userRole: string,
  userOrgType: 'admin' | 'client',
  targetOrgType: 'admin' | 'client',
  isAssignedAgent: boolean = false
): boolean {
  // System admins and 5AM admins can access everything
  if (
    [HEALTHCARE_ROLES.SYSTEM_ADMIN, HEALTHCARE_ROLES.FIVE_AM_ADMIN].includes(
      userRole as typeof HEALTHCARE_ROLES.SYSTEM_ADMIN | typeof HEALTHCARE_ROLES.FIVE_AM_ADMIN
    )
  ) {
    return true;
  }

  // 5AM agents can only access assigned client organizations
  if (userRole === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
    return targetOrgType === 'client' && isAssignedAgent;
  }

  // Client organization users can only access their own organization
  if (userOrgType === 'client') {
    return userOrgType === targetOrgType;
  }

  return false;
}

/**
 * Get filtered permissions based on organization context
 */
export function getContextualPermissions(
  userRole: string,
  userOrgType: 'admin' | 'client',
  targetOrgType: 'admin' | 'client'
) {
  const basePermissions = getRolePermissions(userRole);
  
  // If user can't access the target organization, return empty permissions
  if (!canAccessOrganization(userRole, userOrgType, targetOrgType)) {
    return {};
  }

  return basePermissions;
}