import { pgTable, text, timestamp, index, boolean, pgEnum, decimal, date } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth-schema";
import { interpretations } from "./interpretations-schema";
import { bookings } from "./bookings-schema";
import { patients } from "./patients-schema";

// Charge entry status enum
export const chargeEntryStatusEnum = pgEnum("charge_entry_status", [
  "pending_entry",      // Ready for charge entry
  "in_progress",        // Being worked on by billing staff
  "completed",          // Charges entered and reviewed
  "submitted_to_billing", // Sent to billing system
  "billed",            // Invoice generated
  "partially_paid",    // Some payment received
  "paid_in_full",      // Fully paid
  "denied",            // Insurance denied
  "appeal_required",   // Needs appeal process
  "write_off",         // Written off as uncollectible
  "cancelled"          // Cancelled charges
]);

// Charge type enum
export const chargeTypeEnum = pgEnum("charge_type", [
  "professional",      // Professional fee (interpretation)
  "technical",         // Technical fee (equipment/facility)
  "global",           // Combined professional + technical
  "modifier",         // Additional modifier charges
  "material",         // Contrast, supplies, devices
  "consultation",     // Additional consultation fees
  "emergency",        // Emergency/after-hours surcharge
  "repeat"           // Repeat procedure charges
]);

// Insurance type enum
export const insuranceTypeEnum = pgEnum("insurance_type", [
  "primary",
  "secondary", 
  "tertiary",
  "self_pay",
  "workers_comp",
  "medicare",
  "medicaid",
  "private"
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "insurance",
  "credit_card",
  "debit_card", 
  "cash",
  "check",
  "bank_transfer",
  "payment_plan",
  "voucher"
]);

// Charge Entries table - Billing and revenue cycle management
export const chargeEntries = pgTable("charge_entries", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
  .notNull()
  .references(() => organizations.id),
  // Links to procedures
  interpretationId: text("interpretation_id")
    .references(() => interpretations.id),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
    
  // Service details
  serviceDate: date("service_date").notNull(),
  procedureDescription: text("procedure_description").notNull(),
  
  // Coding information
  primaryCptCode: text("primary_cpt_code").notNull(), // Primary procedure code
  secondaryCptCodes: text("secondary_cpt_codes"), // JSON array of additional codes
  icdCodes: text("icd_codes"), // JSON array of diagnosis codes
  modifiers: text("modifiers"), // JSON array of modifier codes
  
  // Charge details
  chargeType: chargeTypeEnum("charge_type").notNull(),
  unitsOfService: decimal("units_of_service", { precision: 10, scale: 2 }).default("1.00").notNull(),
  chargeAmount: decimal("charge_amount", { precision: 10, scale: 2 }).notNull(),
  allowedAmount: decimal("allowed_amount", { precision: 10, scale: 2 }),
  contractualAdjustment: decimal("contractual_adjustment", { precision: 10, scale: 2 }).default("0.00"),
  
  // Insurance information
  primaryInsurance: text("primary_insurance"),
  primaryInsuranceId: text("primary_insurance_id"), // Policy number
  secondaryInsurance: text("secondary_insurance"),
  secondaryInsuranceId: text("secondary_insurance_id"),
  insuranceType: insuranceTypeEnum("insurance_type").default("primary").notNull(),
  
  // Authorization
  priorAuthNumber: text("prior_auth_number"),
  referralNumber: text("referral_number"),
  authorizationRequired: boolean("authorization_required").default(false).notNull(),
  authorizationObtained: boolean("authorization_obtained").default(false).notNull(),
  
  // Billing timeline
  chargeEnteredDate: date("charge_entered_date"),
  chargeEnteredBy: text("charge_entered_by").references(() => users.id),
  submittedToBillingDate: date("submitted_to_billing_date"),
  submittedToBillingBy: text("submitted_to_billing_by").references(() => users.id),
  
  // Claim information
  claimNumber: text("claim_number"),
  batchNumber: text("batch_number"),
  clearinghouseId: text("clearinghouse_id"),
  submissionDate: date("submission_date"),
  
  // Payment tracking
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  patientResponsibility: decimal("patient_responsibility", { precision: 10, scale: 2 }).default("0.00"),
  lastPaymentDate: date("last_payment_date"),
  lastPaymentAmount: decimal("last_payment_amount", { precision: 10, scale: 2 }),
  lastPaymentMethod: paymentMethodEnum("last_payment_method"),
  
  // Denial and appeal information
  denialDate: date("denial_date"),
  denialReason: text("denial_reason"),
  denialCode: text("denial_code"),
  appealDate: date("appeal_date"),
  appealOutcome: text("appeal_outcome"),
  
  // Write-off information
  writeOffDate: date("write_off_date"),
  writeOffAmount: decimal("write_off_amount", { precision: 10, scale: 2 }),
  writeOffReason: text("write_off_reason"),
  writeOffBy: text("write_off_by").references(() => users.id),
  
  // Status and workflow
  status: chargeEntryStatusEnum("status").default("pending_entry").notNull(),
  
  // Quality and compliance
  chargeReviewed: boolean("charge_reviewed").default(false).notNull(),
  chargeReviewedBy: text("charge_reviewed_by").references(() => users.id),
  chargeReviewedDate: date("charge_reviewed_date"),
  complianceNotes: text("compliance_notes"),
  
  // Follow-up tracking
  followUpRequired: boolean("follow_up_required").default(false).notNull(),
  followUpDate: date("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  
  // Revenue cycle metrics
  daysInAR: text("days_in_ar"), // Days in accounts receivable
  collectionEfforts: text("collection_efforts"), // Number of collection attempts
  
  // Notes and comments
  billingNotes: text("billing_notes"),
  internalNotes: text("internal_notes"),
  
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
  // Indexes for performance
  index("charge_entries_organization_id_idx").on(table.organizationId),
  index("charge_entries_interpretation_id_idx").on(table.interpretationId),
  index("charge_entries_booking_id_idx").on(table.bookingId),
  index("charge_entries_patient_id_idx").on(table.patientId),
  index("charge_entries_status_idx").on(table.status),
  index("charge_entries_service_date_idx").on(table.serviceDate),
  index("charge_entries_primary_cpt_code_idx").on(table.primaryCptCode),
  index("charge_entries_charge_type_idx").on(table.chargeType),
  index("charge_entries_insurance_type_idx").on(table.insuranceType),
  index("charge_entries_claim_number_idx").on(table.claimNumber),
  index("charge_entries_submission_date_idx").on(table.submissionDate),
  index("charge_entries_follow_up_required_idx").on(table.followUpRequired),
  index("charge_entries_follow_up_date_idx").on(table.followUpDate),
  index("charge_entries_deleted_at_idx").on(table.deletedAt),
  index("charge_entries_created_by_idx").on(table.createdBy),
  index("charge_entries_updated_by_idx").on(table.updatedBy),
]);