// lib/permissions/healthcare-permissions-constants.ts

/**
 * Healthcare-specific resources for access control
 */
export const HEALTHCARE_RESOURCES = {
  PATIENT: "patient",
  APPOINTMENT: "appointment",
  BOOKING: "booking",
  INTERPRETATION: "interpretation",
  HOLTER_ASSIGNMENT: "holter_assignment",
  HOLTER_DEVICE: "holter_device",
  INTERPRETING_DOCTOR: "interpreting_doctor",
  REFERRING_DOCTOR: "referring_doctor",
  REFERRING_ENTITY: "referring_entity",
  PROCEDURE_LOCATION: "procedure_location",
  TECHNICIAN: "technician",
  AUDIT_LOGS: "audit_logs",
} as const;

/**
 * Healthcare-specific actions
 */
export const HEALTHCARE_ACTIONS = {
  // PHI (Protected Health Information) actions
  VIEW_PHI: "view_phi",
  EDIT_PHI: "edit_phi",
  EXPORT_PHI: "export_phi",
  
  // Appointment actions
  SCHEDULE_APPOINTMENT: "schedule_appointment",
  RESCHEDULE_APPOINTMENT: "reschedule_appointment",
  CANCEL_APPOINTMENT: "cancel_appointment",
  
  // Booking/Procedure actions
  CHECK_IN_PATIENT: "check_in_patient",
  START_PROCEDURE: "start_procedure",
  COMPLETE_PROCEDURE: "complete_procedure",
  
  // Device management
  ASSIGN_DEVICE: "assign_device",
  TRACK_DEVICE: "track_device",
  MAINTAIN_DEVICE: "maintain_device",
  
  // Interpretation actions
  ASSIGN_INTERPRETATION: "assign_interpretation",
  COMPLETE_INTERPRETATION: "complete_interpretation",
  
  // Audit actions
  VIEW_AUDIT_LOGS: "view_audit_logs",
  EXPORT_AUDIT_LOGS: "export_audit_logs",
} as const;

/**
 * Healthcare role definitions
 */
export const HEALTHCARE_ROLES = {
  // 5AM Corp (Admin Organization) Roles
  SYSTEM_ADMIN: "system_admin",
  FIVE_AM_ADMIN: "five_am_admin", 
  FIVE_AM_AGENT: "five_am_agent",
  
  // Client Organization Roles
  CLIENT_ADMIN: "client_admin",
  FRONT_DESK: "front_desk",
  TECHNICIAN: "technician", 
  INTERPRETING_DOCTOR: "interpreting_doctor",
} as const;

/**
 * Better Auth default actions for core resources
 */
export const ORGANIZATION_ACTIONS = {
  CREATE: "create",
  UPDATE: "update", 
  DELETE: "delete",
  READ: "read",
} as const;

export const MEMBER_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete", 
  READ: "read",
} as const;

export const INVITATION_ACTIONS = {
  CREATE: "create",
  CANCEL: "cancel",
  READ: "read",
} as const;

export const USER_ACTIONS = {
  CREATE: "create",
  LIST: "list",
  SET_ROLE: "set-role",
  BAN: "ban",
  IMPERSONATE: "impersonate",
  DELETE: "delete",
} as const;

export const SESSION_ACTIONS = {
  LIST: "list",
  REVOKE: "revoke",
  DELETE: "delete",
} as const;