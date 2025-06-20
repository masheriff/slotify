/**
 * healthcare-access-control.ts
 * 
 * Access control system tailored for Slotify healthcare scheduling
 */

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
  ],
  [HEALTHCARE_RESOURCES.APPOINTMENT]: [
    HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT,
    HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT,
    HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT,
    'view', 'edit', 'delete'
  ],
  [HEALTHCARE_RESOURCES.BOOKING]: [
    HEALTHCARE_ACTIONS.CHECK_IN_PATIENT,
    HEALTHCARE_ACTIONS.START_PROCEDURE,
    HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE,
    'view', 'edit', 'cancel'
  ],
  [HEALTHCARE_RESOURCES.INTERPRETATION]: [
    HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION,
    HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION,
    'view', 'edit', 'review'
  ],
  [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [
    HEALTHCARE_ACTIONS.ASSIGN_DEVICE,
    HEALTHCARE_ACTIONS.TRACK_DEVICE,
    'view', 'edit', 'complete'
  ],
  [HEALTHCARE_RESOURCES.CHARGE_ENTRY]: [
    HEALTHCARE_ACTIONS.ENTER_CHARGES,
    HEALTHCARE_ACTIONS.REVIEW_CHARGES,
    HEALTHCARE_ACTIONS.SUBMIT_BILLING,
    'view', 'edit'
  ],
  [HEALTHCARE_RESOURCES.TECHNICIAN]: [
    'view', 'edit', 'create', 'deactivate'
  ],
  [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: [
    'view', 'edit', 'create', 'assign'
  ],
  [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: [
    HEALTHCARE_ACTIONS.MAINTAIN_DEVICE,
    'view', 'edit', 'create', 'retire'
  ],
} as const;

export const ac = createAccessControl(statements);

/**
 * 5AM Corp admin organization roles
 * These users manage the appointment scheduling platform and provide services to clients
 */
export const adminRoles = {
  [HEALTHCARE_ROLES.SYSTEM_ADMIN]: ac.newRole({
    // Full platform administration access
    organization: [ORGANIZATION_ACTIONS.UPDATE, ORGANIZATION_ACTIONS.DELETE],
    member: [MEMBER_ACTIONS.CREATE, MEMBER_ACTIONS.UPDATE, MEMBER_ACTIONS.DELETE],
    invitation: [INVITATION_ACTIONS.CREATE, INVITATION_ACTIONS.CANCEL],
    user: [USER_ACTIONS.CREATE, USER_ACTIONS.LIST, USER_ACTIONS.SET_ROLE, USER_ACTIONS.BAN, USER_ACTIONS.IMPERSONATE, USER_ACTIONS.DELETE],
    session: [SESSION_ACTIONS.LIST, SESSION_ACTIONS.REVOKE, SESSION_ACTIONS.DELETE],
    
    // Cross-client access for platform management (with audit trail)
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EXPORT_PHI],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit', 'delete', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit', 'cancel'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view', HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION],
    [HEALTHCARE_RESOURCES.CHARGE_ENTRY]: ['view', HEALTHCARE_ACTIONS.REVIEW_CHARGES],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.INTERPRETING_DOCTOR]: ['view', 'edit', 'create', 'assign'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', 'create', 'retire', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
  }),

  [HEALTHCARE_ROLES.BILLING_MANAGER]: ac.newRole({
    // 5AM Corp billing staff managing revenue across all clients
    [HEALTHCARE_RESOURCES.CHARGE_ENTRY]: [HEALTHCARE_ACTIONS.ENTER_CHARGES, HEALTHCARE_ACTIONS.REVIEW_CHARGES, HEALTHCARE_ACTIONS.SUBMIT_BILLING, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI], // Limited PHI access for billing
    [HEALTHCARE_RESOURCES.BOOKING]: ['view'], // Read-only access to procedures
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view'], // Read-only access to interpretations
  }),

  [HEALTHCARE_ROLES.COMPLIANCE_OFFICER]: ac.newRole({
    // 5AM Corp compliance team ensuring HIPAA compliance across platform
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: ['view'],
    [HEALTHCARE_RESOURCES.CHARGE_ENTRY]: ['view'],
    user: [USER_ACTIONS.LIST], // Can view user activity for audits
    session: [SESSION_ACTIONS.LIST], // Can view session activity for audits
  }),

  // 5AM Corp customer success team
  [HEALTHCARE_ROLES.CLIENT_SUCCESS_MANAGER]: ac.newRole({
    // Help Hart Medical Center and other clients optimize their workflow
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view', 'edit'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [HEALTHCARE_ACTIONS.TRACK_DEVICE, 'view'],
    // No PHI access - only scheduling and operational data
  }),
};

/**
 * Client organization roles (Hart Medical Center and future healthcare clients)
 * These are the healthcare facility staff who use the appointment scheduling system
 */
export const clientRoles = {
  [HEALTHCARE_ROLES.FACILITY_ADMIN]: ac.newRole({
    // Hart Medical Center admin managing their facility's operations
    member: [MEMBER_ACTIONS.CREATE, MEMBER_ACTIONS.UPDATE, MEMBER_ACTIONS.DELETE],
    invitation: [INVITATION_ACTIONS.CREATE, INVITATION_ACTIONS.CANCEL],
    
    // Full access to their own facility's data only
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI, HEALTHCARE_ACTIONS.EXPORT_PHI],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: [HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.BOOKING]: [HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.INTERPRETATION]: [HEALTHCARE_ACTIONS.ASSIGN_INTERPRETATION, 'view'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.CHARGE_ENTRY]: ['view'], // Can view but 5AM Corp handles billing
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view', 'edit', 'create', 'deactivate'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
  }),

  [HEALTHCARE_ROLES.TECHNICIAN]: ac.newRole({
    // Hart Medical Center technicians performing procedures
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI], // Limited PHI access for procedures
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view'],
    [HEALTHCARE_RESOURCES.BOOKING]: [HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE, 'view', 'edit', 'complete'],
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
  }),

  [HEALTHCARE_ROLES.LEAD_TECHNICIAN]: ac.newRole({
    // Senior Hart Medical Center technician with oversight responsibilities
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI, HEALTHCARE_ACTIONS.EDIT_PHI],
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', 'edit'],
    [HEALTHCARE_RESOURCES.BOOKING]: [HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, HEALTHCARE_ACTIONS.START_PROCEDURE, HEALTHCARE_ACTIONS.COMPLETE_PROCEDURE, 'view', 'edit', 'cancel'],
    [HEALTHCARE_RESOURCES.HOLTER_ASSIGNMENT]: [HEALTHCARE_ACTIONS.ASSIGN_DEVICE, HEALTHCARE_ACTIONS.TRACK_DEVICE, 'view', 'edit', 'complete'],
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view'], // Can view other technicians in their facility
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view', 'edit', HEALTHCARE_ACTIONS.MAINTAIN_DEVICE],
  }),

  [HEALTHCARE_ROLES.INTERPRETING_DOCTOR]: ac.newRole({
    // Cardiologists/radiologists reading studies (may work for multiple facilities)
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI], // PHI access for medical interpretation
    [HEALTHCARE_RESOURCES.BOOKING]: ['view'], // View procedure details
    [HEALTHCARE_RESOURCES.INTERPRETATION]: [HEALTHCARE_ACTIONS.COMPLETE_INTERPRETATION, 'view', 'edit', 'review'],
  }),

  [HEALTHCARE_ROLES.SCHEDULER]: ac.newRole({
    // Hart Medical Center scheduling staff
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI], // Limited PHI for scheduling
    [HEALTHCARE_RESOURCES.APPOINTMENT]: [HEALTHCARE_ACTIONS.SCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT, HEALTHCARE_ACTIONS.CANCEL_APPOINTMENT, 'view', 'edit'],
    [HEALTHCARE_RESOURCES.BOOKING]: ['view'], // View bookings for scheduling
    [HEALTHCARE_RESOURCES.TECHNICIAN]: ['view'], // View technician availability
    [HEALTHCARE_RESOURCES.HOLTER_DEVICE]: ['view'], // View device availability
  }),

  // Reception/front desk staff
  [HEALTHCARE_ROLES.FRONT_DESK]: ac.newRole({
    // Hart Medical Center front desk staff handling check-ins
    [HEALTHCARE_RESOURCES.PATIENT]: [HEALTHCARE_ACTIONS.VIEW_PHI], // Limited PHI for check-in
    [HEALTHCARE_RESOURCES.APPOINTMENT]: ['view', HEALTHCARE_ACTIONS.RESCHEDULE_APPOINTMENT],
    [HEALTHCARE_RESOURCES.BOOKING]: [HEALTHCARE_ACTIONS.CHECK_IN_PATIENT, 'view'],
  }),
};

/**
 * Combined roles for export
 */
export const healthcareRoles = {
  ...adminRoles,
  ...clientRoles,
};