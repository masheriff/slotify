import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth-schema";
import { bookings } from "./bookings-schema";
import { interpretingDoctors } from "./interpreting-doctors-schema";
import { ta } from "zod/v4/locales";

// Interpretation status enum
export const interpretationStatusEnum = pgEnum("interpretation_status", [
  "pending_assignment",   // Waiting for doctor assignment
  "assigned",            // Doctor assigned, not started
  "in_progress",         // Doctor actively reading
  "preliminary_complete", // Initial reading done
  "under_review",        // Senior doctor reviewing
  "final_complete",      // Final report ready
  "addendum_required",   // Additional information needed
  "critical_findings",   // Urgent findings requiring immediate attention
  "delivered",          // Report delivered to referring physician
  "ready_for_billing",  // Ready for charge entry
  "billing_complete"    // Charges entered and submitted
]);

// Interpretation priority enum
export const interpretationPriorityEnum = pgEnum("interpretation_priority", [
  "routine",
  "urgent", 
  "stat",
  "critical"
]);

// Report status enum
export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "preliminary",
  "final",
  "amended",
  "addendum"
]);

// Interpretations table - Reading/analysis phase
export const interpretations = pgTable("interpretations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
  .notNull()
  .references(() => organizations.id),
  // Link to booking
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id),
    
  // Doctor assignment
  interpretingDoctorId: text("interpreting_doctor_id")
    .references(() => interpretingDoctors.id),
  reviewingDoctorId: text("reviewing_doctor_id")
    .references(() => interpretingDoctors.id), // For peer review or senior oversight
    
  // Interpretation timeline
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  preliminaryCompletedAt: timestamp("preliminary_completed_at"),
  finalCompletedAt: timestamp("final_completed_at"),
  deliveredAt: timestamp("delivered_at"),
  
  // Priority and urgency
  priority: interpretationPriorityEnum("priority").default("routine").notNull(),
  isEmergencyRead: boolean("is_emergency_read").default(false).notNull(),
  criticalFindings: boolean("critical_findings").default(false).notNull(),
  criticalFindingsNotifiedAt: timestamp("critical_findings_notified_at"),
  
  // Report content
  reportText: text("report_text"),
  impression: text("impression"),
  recommendations: text("recommendations"),
  technicalNotes: text("technical_notes"),
  
  // Report versioning
  reportStatus: reportStatusEnum("report_status").default("draft").notNull(),
  reportVersion: text("report_version").default("1.0").notNull(),
  previousReportId: text("previous_report_id"), // For amendments/addendums
  
  // Quality measures
  interpretationTime: text("interpretation_time"), // Time taken to complete
  complexityScore: text("complexity_score"), // e.g., "Low", "Medium", "High"
  confidenceLevel: text("confidence_level"), // Doctor's confidence in interpretation
  
  // Review process
  reviewRequired: boolean("review_required").default(false).notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  reviewApproved: boolean("review_approved"),
  
  // Communication
  criticalResultsCommunicated: boolean("critical_results_communicated").default(false).notNull(),
  communicatedTo: text("communicated_to"), // Who was notified of critical findings
  communicationMethod: text("communication_method"), // Phone, fax, secure message, etc.
  communicationTime: timestamp("communication_time"),
  
  // Follow-up requirements
  followUpRequired: boolean("follow_up_required").default(false).notNull(),
  followUpRecommendations: text("follow_up_recommendations"),
  followUpTimeframe: text("follow_up_timeframe"), // e.g., "3 months", "1 year"
  
  // External consultation
  consultationRequired: boolean("consultation_required").default(false).notNull(),
  consultingSpecialist: text("consulting_specialist"),
  consultationNotes: text("consultation_notes"),
  
  // Status tracking
  status: interpretationStatusEnum("status").default("pending_assignment").notNull(),
  
  // Billing and coding
  diagnosticCodes: text("diagnostic_codes"), // ICD-10 codes
  procedureCodes: text("procedure_codes"), // CPT codes
  
  // File attachments
  reportFilePath: text("report_file_path"), // Path to final report PDF
  attachmentPaths: text("attachment_paths"), // JSON array of additional files
  
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
}, (table) => [
  //indexes for performance
  index("interpretations_organization_id_idx").on(table.organizationId),
  index("interpretations_booking_id_idx").on(table.bookingId),
  index("interpretations_interpreting_doctor_id_idx").on(table.interpretingDoctorId),
  index("interpretations_reviewing_doctor_id_idx").on(table.reviewingDoctorId),
  index("interpretations_status_idx").on(table.status),
  index("interpretations_priority_idx").on(table.priority),
  index("interpretations_report_status_idx").on(table.reportStatus),
  index("interpretations_assigned_at_idx").on(table.assignedAt),
  index("interpretations_final_completed_at_idx").on(table.finalCompletedAt),
  index("interpretations_critical_findings_idx").on(table.criticalFindings),
  index("interpretations_is_emergency_read_idx").on(table.isEmergencyRead),
  index("interpretations_review_required_idx").on(table.reviewRequired),
  index("interpretations_follow_up_required_idx").on(table.followUpRequired),
  index("interpretations_deleted_at_idx").on(table.deletedAt),
  index("interpretations_created_by_idx").on(table.createdBy),
  index("interpretations_updated_by_idx").on(table.updatedBy),
]);