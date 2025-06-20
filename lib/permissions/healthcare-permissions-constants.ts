/**
 * healthcare-permissions-constants.ts
 * 
 * Healthcare-specific resources and actions for Slotify
 */

/**
 * Actions for organization resources (match Better Auth exactly)
 */
export const ORGANIZATION_ACTIONS = {
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export const MEMBER_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export const INVITATION_ACTIONS = {
  CREATE: 'create',
  CANCEL: 'cancel',
} as const;

export const TEAM_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * Actions for admin resources (match Better Auth exactly)
 */
export const USER_ACTIONS = {
  CREATE: 'create',
  LIST: 'list',
  SET_ROLE: 'set-role',
  BAN: 'ban',
  IMPERSONATE: 'impersonate',
  DELETE: 'delete',
} as const;

export const SESSION_ACTIONS = {
  LIST: 'list',
  REVOKE: 'revoke',
  DELETE: 'delete',
} as const;

export const HEALTHCARE_RESOURCES = {
  // Patient management
  PATIENT: 'patient',
  APPOINTMENT: 'appointment',
  BOOKING: 'booking',
  
  // Clinical workflow
  INTERPRETATION: 'interpretation',
  HOLTER_ASSIGNMENT: 'holter_assignment',
  CHARGE_ENTRY: 'charge_entry',
  
  // Staff and equipment
  TECHNICIAN: 'technician',
  INTERPRETING_DOCTOR: 'interpreting_doctor',
  HOLTER_DEVICE: 'holter_device',
  
  // Healthcare entities
  REFERRING_DOCTOR: 'referring_doctor',
  REFERRING_ENTITY: 'referring_entity',
  PROCEDURE_LOCATION: 'procedure_location',
} as const;

export const HEALTHCARE_ACTIONS = {
  // Patient data actions (HIPAA-sensitive)
  VIEW_PHI: 'view_phi',
  EDIT_PHI: 'edit_phi',
  EXPORT_PHI: 'export_phi',
  
  // Scheduling actions
  SCHEDULE_APPOINTMENT: 'schedule_appointment',
  RESCHEDULE_APPOINTMENT: 'reschedule_appointment',
  CANCEL_APPOINTMENT: 'cancel_appointment',
  
  // Clinical workflow actions
  CHECK_IN_PATIENT: 'check_in_patient',
  START_PROCEDURE: 'start_procedure',
  COMPLETE_PROCEDURE: 'complete_procedure',
  ASSIGN_INTERPRETATION: 'assign_interpretation',
  COMPLETE_INTERPRETATION: 'complete_interpretation',
  
  // Device management
  ASSIGN_DEVICE: 'assign_device',
  TRACK_DEVICE: 'track_device',
  MAINTAIN_DEVICE: 'maintain_device',
  
  // Billing actions
  ENTER_CHARGES: 'enter_charges',
  REVIEW_CHARGES: 'review_charges',
  SUBMIT_BILLING: 'submit_billing',
  
  // Reporting actions
  GENERATE_REPORTS: 'generate_reports',
  VIEW_ANALYTICS: 'view_analytics',
} as const;

// Healthcare-specific roles based on your schemas
export const HEALTHCARE_ROLES = {
  // 5AM Corp admin organization roles (service provider)
  SYSTEM_ADMIN: 'system_admin',
  BILLING_MANAGER: 'billing_manager',
  COMPLIANCE_OFFICER: 'compliance_officer',
  CLIENT_SUCCESS_MANAGER: 'client_success_manager', // Helps Hart Medical Center optimize workflows
  
  // Hart Medical Center client organization roles (healthcare facility)
  FACILITY_ADMIN: 'facility_admin',        // Hart Medical Center administrator
  TECHNICIAN: 'technician',                // Hart Medical Center technicians
  LEAD_TECHNICIAN: 'lead_technician',      // Senior Hart Medical Center technicians
  INTERPRETING_DOCTOR: 'interpreting_doctor', // Cardiologists/radiologists (may serve multiple facilities)
  SCHEDULER: 'scheduler',                  // Hart Medical Center scheduling staff
  FRONT_DESK: 'front_desk',               // Hart Medical Center reception staff
  
  // Default role
  MEMBER: 'member',
} as const;

// Organization types from your auth schema
export const HEALTHCARE_ORG_TYPES = {
  ADMIN: 'admin',      // 5AM Corp - provides appointment management services
  CLIENT: 'client',    // Hart Medical Center and future healthcare clients
} as const;

// Specific organization identifiers
export const ORGANIZATIONS = {
  FIVE_AM_CORP: '5am-corp',           // Admin org providing the service
  HART_MEDICAL_CENTER: 'hart-medical', // First client organization
} as const;