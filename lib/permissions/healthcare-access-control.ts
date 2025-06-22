// lib/permissions/healthcare-access-control.ts

import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements as orgDefaultStatements } from 'better-auth/plugins/organization/access';
import { defaultStatements as adminDefaultStatements } from 'better-auth/plugins/admin/access';
import { 
  HEALTHCARE_RESOURCES, 
  HEALTHCARE_ACTIONS, 
  HEALTHCARE_ROLES,
  ORGANIZATION_ACTIONS,
  MEMBER_ACTIONS,
  INVITATION_ACTIONS,
  USER_ACTIONS,
  SESSION_ACTIONS
} from './healthcare-permissions-constants';

/**
 * Define all resources and their available actions
 */
const statements = {
  // Better Auth default statements
  organization: orgDefaultStatements.organization,
  member: orgDefaultStatements.member,
  invitation: orgDefaultStatements.invitation,
  user: adminDefaultStatements.user,
  session: adminDefaultStatements.session,
  
  // Healthcare-specific resources
  [HEALTHCARE_RESOURCES.PATIENT]: [
    HEALTHCARE_ACTIONS.VIEW_PHI,
    HEALTHCARE_ACTIONS.EDIT_PHI,
    HEALTHCARE_ACTIONS.EXPORT_PHI,
    'view', 'edit', 'create', 'delete'
  ],
  [HEALTHCARE_RESOURCES.APPOINTMENT]: [
    HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT,
    HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT,
    HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT,
    'view', 'edit', 'create', 'delete'
  ],
  [HEALTHCARE_RESOURCES.BOOKING]: [
    HEALTHCARE_ACTIONS.CHECK_IN_PATIENT,
    HEALTHCARE_ACTIONS.START_PROCEDURE,
    HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE,
    'view', 'edit', 'create', 'cancel'
  ],
  [HEALTHCARE_RESOURCES.INTERPRETATION]: [
    HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION,
    HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION,
    'view', 'edit', 'create', 'review'
  ],
  [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [
    HEALTHCARE_ACTIONS.ASSIGN_DEVICE,
    HEALTHCARE_ACTIONS.TRACK_DEVICE,
    'view', 'edit', 'create', 'complete'
  ],
  [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: [
    HEALTHCARE_ACTIONS.MAINTAIN_DEVICE,
    'view', 'edit', 'create', 'retire'
  ],
  [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: [
    'view', 'edit', 'create', 'assign'
  ],
  [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: [
    'view', 'edit', 'create', 'deactivate'
  ],
  [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: [
    'view', 'edit', 'create', 'deactivate'
  ],
  [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: [
    'view', 'edit', 'create', 'deactivate'
  ],
  [HEALTHCARE_RESOURCES.TECHNICIAN]: [
    'view', 'edit', 'create', 'deactivate'
  ],
  [HEALTHCARE_RESOURCES.AUDIT_LOGS]: [
    HEALTHCARE_ACTIONS.VIEW_AUDIT_LOGS,
    HEALTHCARE_ACTIONS.EXPORT_AUDIT_LOGS,
    'view'
  ],
} as const;

export const ac = createAccessControl(statements);

/**
 * Complete Healthcare role definitions with permissions
 */
export const healthcareRoles = {
  // =====================================
  // 5AM CORP (ADMIN ORGANIZATION) ROLES
  // =====================================
  
  [HEALTHCARE_ROLES.SYSTEM_ADMIN]: ac.newRole({
    // Full platform administration access
    organization: [ORGANIZATION_ACTIONS.UPDATE, ORGANIZATION_ACTIONS.DELETE],
    member: [MEMBER_ACTIONS.CREATE, MEMBER_ACTIONS.UPDATE, MEMBER_ACTIONS.DELETE],
    invitation: [INVITATION_ACTIONS.CREATE, INVITATION_ACTIONS.CANCEL],
    user: [USER_ACTIONS.CREATE, USER_ACTIONS.LIST, USER_ACTIONS['SET_ROLE'], USER_ACTIONS.BAN, USER_ACTIONS.IMPERSONATE, USER_ACTIONS.DELETE],
    session: [SESSION_ACTIONS.LIST, SESSION_ACTIONS.REVOKE, SESSION_ACTIONS.DELETE],
    
    // Full access to all healthcare resources across all organizations
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI, HEALTHCARE_ACTIONS.EXPORT_PHI, 'view', 'edit', 'create', 'delete'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit', 'create', 'delete', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'create', 'cancel', HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', 'edit', 'create', 'review', HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION, HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['view', 'edit', 'create', 'complete', HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', 'create', 'retire', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['view', 'edit', 'create', 'assign'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.AUDIT_LOGS]: [HEALTHCARE_ACTIONS.VIEW_AUDIT_LOGS, HEALTHCARE_ACTIONS.EXPORT_AUDIT_LOGS, 'view'],
  }),

  [HEALTHCARE_ROLES.FIVE_AM_ADMIN]: ac.newRole({
    // Organization management without user impersonation/ban powers
    organization: [ORGANIZATION_ACTIONS.UPDATE, ORGANIZATION_ACTIONS.DELETE],
    member: [MEMBER_ACTIONS.CREATE, MEMBER_ACTIONS.UPDATE, MEMBER_ACTIONS.DELETE],
    invitation: [INVITATION_ACTIONS.CREATE, INVITATION_ACTIONS.CANCEL],
    user: [USER_ACTIONS.CREATE, USER_ACTIONS.LIST, USER_ACTIONS.SET_ROLE], // No ban/impersonate
    session: [SESSION_ACTIONS.LIST, SESSION_ACTIONS.REVOKE],
    
    // Full healthcare access across all client organizations
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI, HEALTHCARE_ACTIONS.EXPORT_PHI, 'view', 'edit', 'create', 'delete'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit', 'create', 'delete', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'create', 'cancel', HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', 'edit', 'create', 'review', HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION, HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['view', 'edit', 'create', 'complete', HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', 'create', 'retire', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['view', 'edit', 'create', 'assign'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.AUDIT_LOGS]: [HEALTHCARE_ACTIONS.VIEW_AUDIT_LOGS, HEALTHCARE_ACTIONS.EXPORT_AUDIT_LOGS, 'view'],
  }),

  [HEALTHCARE_ROLES.FIVE_AM_AGENT]: ac.newRole({
    // Limited access to assigned client organizations only (filtered by agentAssignedOrgs)
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI, 'view', 'edit', 'create'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['view', 'edit', 'create', 'complete', HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['view', 'edit', 'create', 'assign'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['view', 'edit', 'create'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['view', 'edit', 'create'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['view', 'edit', 'create'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create'],
  }),

  // =====================================
  // CLIENT ORGANIZATION ROLES
  // =====================================

  [HEALTHCARE_ROLES.CLIENT_ADMIN]: ac.newRole({
    // Client organization admin managing their facility's operations
    member: [MEMBER_ACTIONS.CREATE, MEMBER_ACTIONS.UPDATE, MEMBER_ACTIONS.DELETE],
    invitation: [INVITATION_ACTIONS.CREATE, INVITATION_ACTIONS.CANCEL],
    
    // Full access to their own facility's data only
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI, HEALTHCARE_ACTIONS.EXPORT_PHI, 'view', 'edit', 'create', 'delete'],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: [HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT, 'view', 'edit', 'create', 'delete'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'create', 'cancel', HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', 'edit', 'create', 'review', HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION, HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['view', 'edit', 'create', 'complete', HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', 'create', 'retire', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['view', 'edit', 'create', 'assign'],
    [HEALTHCARE_RESOURCES.REFERRING_DOCTOR]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.REFERRING_ENTITY]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.PROCEDURE_LOCATION]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.AUDIT_LOGS]: [HEALTHCARE_ACTIONS.VIEW_AUDIT_LOGS, 'view'],
  }),

  [HEALTHCARE_ROLES.FRONT_DESK]: ac.newRole({
    // Front desk staff - limited to assigned procedure-test-locations (filtered by assignedLocationIds)
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, 'view', 'edit'], // Basic patient info for scheduling
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.CHECK_IN_PATIENT],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view'], // Can view to assign technicians
  }),

  [HEALTHCARE_ROLES.TECHNICIAN]: ac.newRole({
    // Technicians - can only see bookings assigned to them
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, 'view'], // Basic patient info for procedures
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.ASSIGN_DEVICE],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit'],
  }),

  [HEALTHCARE_ROLES.INTERPRETING_DOCTOR]: ac.newRole({
    // Interpreting doctors - can only see interpretations assigned to them
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, 'view'], // Patient info needed for interpretation
    [HEALTHCARE_RESOURCES.BOOKING]: ['view'], // Can view booking details for context
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', 'edit', 'create', HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION],
  }),
};

/**
 * Helper function to check if user has access to specific organization
 * Used for agents with agentAssignedOrgs filtering
 */
export function hasOrganizationAccess(
  userRole: string,
  userOrgId: string,
  targetOrgId: string,
  agentAssignedOrgs: string[] = []
): boolean {
  // System admins and 5AM admins have access to all organizations
  if (userRole === HEALTHCARE_ROLES.SYSTEM_ADMIN || userRole === HEALTHCARE_ROLES.FIVE_AM_ADMIN) {
    return true;
  }
  
  // Agents can only access their assigned organizations
  if (userRole === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
    return agentAssignedOrgs.includes(targetOrgId);
  }
  
  // Client organization members can only access their own organization
  return userOrgId === targetOrgId;
}

/**
 * Helper function to check if user has access to specific location
 * Used for front desk users with assignedLocationIds filtering
 */
export function hasLocationAccess(
  userRole: string,
  targetLocationId: string,
  assignedLocationIds: string[] = []
): boolean {
  // Only front desk users have location-based restrictions
  if (userRole === HEALTHCARE_ROLES.FRONT_DESK) {
    return assignedLocationIds.length === 0 || assignedLocationIds.includes(targetLocationId);
  }
  
  // All other roles have access to all locations within their organization scope
  return true;
}

/**
 * Helper function to check if user can access specific booking/appointment
 * Used for technicians and interpreting doctors who can only see assigned items
 */
export function hasBookingAccess(
  userRole: string,
  userId: string,
  booking: {
    assignedTechnicianId?: string;
    assignedInterpretingDoctorId?: string;
    organizationId: string;
  },
  userOrgId: string
): boolean {
  // First check if user has access to the organization
  if (booking.organizationId !== userOrgId) {
    return false;
  }

  // Technicians can only see bookings assigned to them
  if (userRole === HEALTHCARE_ROLES.TECHNICIAN) {
    return booking.assignedTechnicianId === userId;
  }

  // Interpreting doctors can only see bookings assigned to them
  if (userRole === HEALTHCARE_ROLES.INTERPRETING_DOCTOR) {
    return booking.assignedInterpretingDoctorId === userId;
  }

  // All other roles can see all bookings in their accessible organizations
  return true;
}

/**
 * Get user permissions for a specific resource and organization
 */
export function getUserPermissions(
  userRole: string,
  resource: string,
  organizationId: string,
  userOrgId: string,
  agentAssignedOrgs: string[] = []
): string[] {
  // Check if user has access to the organization first
  if (!hasOrganizationAccess(userRole, userOrgId, organizationId, agentAssignedOrgs)) {
    return [];
  }

  // Get the role definition
  const roleDefinition = healthcareRoles[userRole as keyof typeof healthcareRoles];

  if (
    !roleDefinition ||
    !(roleDefinition.statements as Record<string, unknown>)[resource]
  ) {
    return [];
  }

  return (roleDefinition.statements as Record<string, string[]>)[resource] ?? [];
}

/**
 * Resource filtering helpers for data access layer
 */
export const ResourceFilters = {
  /**
   * Filter organizations based on user access
   */
  getAccessibleOrganizations(
    userRole: string,
    userOrgId: string,
    agentAssignedOrgs: string[] = []
  ): string[] {
    if (userRole === HEALTHCARE_ROLES.SYSTEM_ADMIN || userRole === HEALTHCARE_ROLES.FIVE_AM_ADMIN) {
      return []; // Empty array means access to all organizations
    }
    
    if (userRole === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
      return agentAssignedOrgs;
    }
    
    // Client organization members can only access their own organization
    return [userOrgId];
  },

  /**
   * Filter locations based on user access
   */
  getAccessibleLocations(
    userRole: string,
    assignedLocationIds: string[] = []
  ): string[] {
    if (userRole === HEALTHCARE_ROLES.FRONT_DESK) {
      return assignedLocationIds;
    }
    
    // All other roles have access to all locations within their organization scope
    return []; // Empty array means access to all locations
  },

  /**
   * Filter bookings based on user access
   */
  getBookingFilters(userRole: string, userId: string): {
    assignedTechnicianId?: string;
    assignedInterpretingDoctorId?: string;
  } {
    if (userRole === HEALTHCARE_ROLES.TECHNICIAN) {
      return { assignedTechnicianId: userId };
    }
    
    if (userRole === HEALTHCARE_ROLES.INTERPRETING_DOCTOR) {
      return { assignedInterpretingDoctorId: userId };
    }
    
    return {}; // No filters for other roles
  },
};

/**
 * Audit logging helpers
 */
export const AuditHelpers = {
  /**
   * Check if action should be audited
   */
  shouldAuditAction(
    action: string,
    resource: 'patient' | 'appointment' | 'booking' | 'interpretation'
  ): boolean {
    const auditableActions = ['create', 'update', 'delete', 'view_phi', 'export_phi'];
    const auditableResources = [
      HEALTHCARE_RESOURCES.PATIENT,
      HEALTHCARE_RESOURCES.APPOINTMENT,
      HEALTHCARE_RESOURCES.BOOKING,
      HEALTHCARE_RESOURCES.INTERPRETATION,
    ];
    
    return auditableActions.includes(action) && auditableResources.includes(resource);
  },

  /**
   * Get audit metadata for an action
   */
  getAuditMetadata(
    userId: string,
    organizationId: string,
    action: string,
    resource: string,
    resourceId?: string
  ) {
    return {
      userId,
      organizationId,
      action: action.toUpperCase(),
      resourceType: resource,
      resourceId,
      timestamp: new Date(),
    };
  },
};

/**
 * Permission check helpers for common scenarios
 */
export const PermissionCheckers = {
  /**
   * Check if user can manage organization members
   */
  canManageMembers(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can view PHI
   */
  canViewPHI(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_AGENT,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
      HEALTHCARE_ROLES.FRONT_DESK,
      HEALTHCARE_ROLES.TECHNICIAN,
      HEALTHCARE_ROLES.INTERPRETING_DOCTOR,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can export PHI
   */
  canExportPHI(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can schedule appointments
   */
  canScheduleAppointments(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_AGENT,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
      HEALTHCARE_ROLES.FRONT_DESK,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can manage devices
   */
  canManageDevices(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_AGENT,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
      HEALTHCARE_ROLES.TECHNICIAN,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can assign interpretations
   */
  canAssignInterpretations(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_AGENT,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },

  /**
   * Check if user can view audit logs
   */
  canViewAuditLogs(userRole: string): boolean {
    const allowedRoles = [
      HEALTHCARE_ROLES.SYSTEM_ADMIN,
      HEALTHCARE_ROLES.FIVE_AM_ADMIN,
      HEALTHCARE_ROLES.CLIENT_ADMIN,
    ];
    return allowedRoles.includes(userRole as typeof allowedRoles[number]);
  },
};