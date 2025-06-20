import { pgTable, text, timestamp, index, boolean, pgEnum, date, integer } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { bookings } from "./bookings-schema";
import { holterDevices } from "./holter-devices-schema";
import { patients } from "./patients-schema";

// Holter assignment status enum
export const holterAssignmentStatusEnum = pgEnum("holter_assignment_status", [
  "device_prepared",     // Device ready for patient
  "device_given",        // Patient has received device
  "with_patient",        // Patient is wearing/using device
  "overdue",            // Past expected return date
  "return_reminder_sent", // Reminder notifications sent
  "device_returned",     // Patient returned device
  "data_downloaded",     // Data extracted from device
  "device_cleaned",      // Device cleaned and ready for reuse
  "assignment_completed" // Full cycle completed
]);

// Contact method enum
export const contactMethodEnum = pgEnum("contact_method", [
  "phone_call",
  "text_message", 
  "email",
  "patient_portal",
  "mail"
]);

// Holter Assignments table - Device tracking & patient follow-up
export const holterAssignments = pgTable("holter_assignments", {
  id: text("id").primaryKey(),
  
  // Links
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  deviceId: text("device_id")
    .notNull()
    .references(() => holterDevices.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
    
  // Device assignment timeline
  devicePreparedDate: timestamp("device_prepared_date"),
  deviceGivenDate: timestamp("device_given_date"),
  expectedReturnDate: date("expected_return_date").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  
  // Patient instructions
  patientInstructions: text("patient_instructions"),
  emergencyContact: text("emergency_contact"),
  specialPrecautions: text("special_precautions"),
  
  // Device condition tracking
  deviceConditionAtGiven: text("device_condition_at_given"), // e.g., "Good", "New", "Functional"
  deviceConditionAtReturn: text("device_condition_at_return"),
  batteryLevelAtGiven: text("battery_level_at_given"),
  batteryLevelAtReturn: text("battery_level_at_return"),
  
  // Follow-up and reminders
  remindersSent: integer("reminders_sent").default(0).notNull(),
  lastReminderDate: timestamp("last_reminder_date"),
  nextFollowUpDate: date("next_follow_up_date"),
  preferredContactMethod: contactMethodEnum("preferred_contact_method").default("phone_call"),
  
  // Patient contact attempts
  contactAttempts: integer("contact_attempts").default(0).notNull(),
  lastContactAttempt: timestamp("last_contact_attempt"),
  contactNotes: text("contact_notes"),
  patientResponsive: boolean("patient_responsive").default(true).notNull(),
  
  // Data processing
  dataDownloadedAt: timestamp("data_downloaded_at"),
  dataDownloadedBy: text("data_downloaded_by").references(() => users.id),
  recordingQuality: text("recording_quality"), // e.g., "Excellent", "Good", "Poor", "Unusable"
  recordingHours: text("recording_hours"), // e.g., "47.5 hours"
  
  // Device cleaning and maintenance
  deviceCleanedAt: timestamp("device_cleaned_at"),
  deviceCleanedBy: text("device_cleaned_by").references(() => users.id),
  maintenanceRequired: boolean("maintenance_required").default(false).notNull(),
  maintenanceNotes: text("maintenance_notes"),
  
  // Status tracking
  status: holterAssignmentStatusEnum("status").default("device_prepared").notNull(),
  
  // Completion tracking
  assignmentCompletedAt: timestamp("assignment_completed_at"),
  assignmentCompletedBy: text("assignment_completed_by").references(() => users.id),
  
  // Issues and escalations
  issuesReported: text("issues_reported"),
  escalationRequired: boolean("escalation_required").default(false).notNull(),
  escalationNotes: text("escalation_notes"),
  
  // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: text("deleted_by").references(() => users.id),
  
  // Audit fields
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id),
});

// Create indexes for better performance
export const holterAssignmentsBookingIdIdx = index("holter_assignments_booking_id_idx").on(holterAssignments.bookingId);
export const holterAssignmentsDeviceIdIdx = index("holter_assignments_device_id_idx").on(holterAssignments.deviceId);
export const holterAssignmentsPatientIdIdx = index("holter_assignments_patient_id_idx").on(holterAssignments.patientId);
export const holterAssignmentsStatusIdx = index("holter_assignments_status_idx").on(holterAssignments.status);
export const holterAssignmentsExpectedReturnIdx = index("holter_assignments_expected_return_idx").on(holterAssignments.expectedReturnDate);
export const holterAssignmentsNextFollowUpIdx = index("holter_assignments_next_follow_up_idx").on(holterAssignments.nextFollowUpDate);
export const holterAssignmentsDeviceGivenDateIdx = index("holter_assignments_device_given_date_idx").on(holterAssignments.deviceGivenDate);
export const holterAssignmentsActualReturnDateIdx = index("holter_assignments_actual_return_date_idx").on(holterAssignments.actualReturnDate);
export const holterAssignmentsEscalationRequiredIdx = index("holter_assignments_escalation_required_idx").on(holterAssignments.escalationRequired);
export const holterAssignmentsDeletedAtIdx = index("holter_assignments_deleted_at_idx").on(holterAssignments.deletedAt);
export const holterAssignmentsCreatedByIdx = index("holter_assignments_created_by_idx").on(holterAssignments.createdBy);
export const holterAssignmentsUpdatedByIdx = index("holter_assignments_updated_by_idx").on(holterAssignments.updatedBy);