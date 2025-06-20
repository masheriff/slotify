import { pgTable, text, timestamp, index, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { patients } from "./patients-schema";
import { referringDoctors } from "./referring-doctors-schema";
import { referringEntities } from "./referring-entity-location-schema";
import { procedureTestLocations } from "./procedure-test-locations-schema";

// Appointment status enum
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "created",
  "confirmed", 
  "rescheduled",
  "cancelled",
  "converted_to_booking",
  "no_show"
]);

// Priority level enum
export const appointmentPriorityEnum = pgEnum("appointment_priority", [
  "routine",
  "urgent", 
  "stat",
  "emergency"
]);

// Appointments table - Initial request/scheduling phase
export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  
  // Patient and referral information
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  referringDoctorId: text("referring_doctor_id")
    .references(() => referringDoctors.id),
  referringEntityId: text("referring_entity_id")
    .references(() => referringEntities.id),
  
  // Procedure location
  procedureLocationId: text("procedure_location_id")
    .notNull()
    .references(() => procedureTestLocations.id),
    
  // Appointment details
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(), // e.g., "14:30"
  estimatedDuration: text("estimated_duration"), // e.g., "30 minutes", "1 hour"
  
  // Request details
  procedureType: text("procedure_type"), // e.g., "MRI Brain", "Echo"
  priority: appointmentPriorityEnum("priority").default("routine").notNull(),
  comments: text("comments"),
  specialInstructions: text("special_instructions"),
  
  // Insurance and authorization
  insuranceAuthorization: text("insurance_authorization"),
  preAuthRequired: boolean("pre_auth_required").default(false).notNull(),
  
  // Status and tracking
  status: appointmentStatusEnum("status").default("created").notNull(),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: text("confirmed_by").references(() => users.id),
  
  // Cancellation details
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: text("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  
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
export const appointmentsPatientIdIdx = index("appointments_patient_id_idx").on(appointments.patientId);
export const appointmentsReferringDoctorIdIdx = index("appointments_referring_doctor_id_idx").on(appointments.referringDoctorId);
export const appointmentsReferringEntityIdIdx = index("appointments_referring_entity_id_idx").on(appointments.referringEntityId);
export const appointmentsProcedureLocationIdIdx = index("appointments_procedure_location_id_idx").on(appointments.procedureLocationId);
export const appointmentsDateIdx = index("appointments_date_idx").on(appointments.appointmentDate);
export const appointmentsStatusIdx = index("appointments_status_idx").on(appointments.status);
export const appointmentsPriorityIdx = index("appointments_priority_idx").on(appointments.priority);
export const appointmentsDeletedAtIdx = index("appointments_deleted_at_idx").on(appointments.deletedAt);
export const appointmentsCreatedByIdx = index("appointments_created_by_idx").on(appointments.createdBy);
export const appointmentsUpdatedByIdx = index("appointments_updated_by_idx").on(appointments.updatedBy);