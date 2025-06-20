import { pgTable, text, timestamp, index, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { appointments } from "./appointments-schema";
import { technicians } from "./technicians-schema";

// Booking status enum
export const bookingStatusEnum = pgEnum("booking_status", [
  "scheduled",
  "checked_in",
  "in_progress", 
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
  "ready_for_billing",  // Procedure complete, ready for charge entry
  "billing_complete"    // Charges entered and submitted
]);

// Procedure completion status enum
export const procedureStatusEnum = pgEnum("procedure_status", [
  "not_started",
  "in_progress",
  "completed",
  "incomplete",
  "cancelled",
  "needs_repeat"
]);

// Bookings table - Procedure execution phase
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  
  // Link to appointment
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => appointments.id)
    .unique(), // One booking per appointment
    
  // Procedure scheduling
  procedureDate: date("procedure_date").notNull(),
  procedureTime: text("procedure_time").notNull(), // e.g., "14:30"
  scheduledDuration: text("scheduled_duration"), // e.g., "45 minutes"
  
  // Staff assignment
  primaryTechnicianId: text("primary_technician_id")
    .references(() => technicians.id),
  assistingTechnicianId: text("assisting_technician_id")
    .references(() => technicians.id),
    
  // Procedure execution details
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  actualDuration: text("actual_duration"), // Calculated or manually entered
  
  // Patient check-in details
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: text("checked_in_by").references(() => users.id),
  patientWeight: text("patient_weight"), // If needed for procedure
  vitalSigns: text("vital_signs"), // JSON or text field
  
  // Procedure details
  procedureNotes: text("procedure_notes"),
  complications: text("complications"),
  equipmentUsed: text("equipment_used"),
  contrastUsed: boolean("contrast_used").default(false).notNull(),
  contrastType: text("contrast_type"),
  contrastAmount: text("contrast_amount"),
  
  // Quality control
  imageQuality: text("image_quality"), // e.g., "Excellent", "Good", "Fair", "Poor"
  technicalNotes: text("technical_notes"),
  repeatRequired: boolean("repeat_required").default(false).notNull(),
  repeatReason: text("repeat_reason"),
  
  // Status tracking
  status: bookingStatusEnum("status").default("scheduled").notNull(),
  procedureStatus: procedureStatusEnum("procedure_status").default("not_started").notNull(),
  
  // Completion details
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by").references(() => users.id),
  
  // Cancellation details
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: text("cancelled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  
  // Files and results
  imagesPaths: text("images_paths"), // JSON array of file paths
  reportPath: text("report_path"), // Path to generated report
  
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
},(table) => [
  index("bookings_appointment_id_idx").on(table.appointmentId),
  index("bookings_primary_technician_id_idx").on(table.primaryTechnicianId),
  index("bookings_assisting_technician_id_idx").on(table.assistingTechnicianId),
  index("bookings_procedure_date_idx").on(table.procedureDate),
  index("bookings_status_idx").on(table.status),
  index("bookings_procedure_status_idx").on(table.procedureStatus),
  index("bookings_checked_in_at_idx").on(table.checkedInAt),
  index("bookings_completed_at_idx").on(table.completedAt),
  index("bookings_deleted_at_idx").on(table.deletedAt),
  index("bookings_created_by_idx").on(table.createdBy),
  index("bookings_updated_by_idx").on(table.updatedBy),
]);