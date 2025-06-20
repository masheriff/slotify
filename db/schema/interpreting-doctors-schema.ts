import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references
import { table } from "console";

// Medical specialties enum for interpreting doctors
export const interpretingSpecialtyEnum = pgEnum("interpreting_specialty", [
  "radiology",
  "cardiology", 
  "pathology",
  "nuclear_medicine",
  "mammography",
  "ultrasound",
  "ct_scan",
  "mri",
  "pet_scan",
  "bone_density",
  "interventional_radiology",
  "neuroradiology",
  "pediatric_radiology",
  "musculoskeletal_radiology",
  "abdominal_radiology",
  "thoracic_radiology",
  "emergency_radiology",
  "echocardiography",
  "stress_testing",
  "holter_monitoring",
  "ekg_interpretation"
]);

// Reading/interpretation status enum
export const readingStatusEnum = pgEnum("reading_status", [
  "active",
  "inactive",
  "on_leave",
  "restricted",
  "emergency_only"
]);

// Interpreting Doctors table
export const interpretingDoctors = pgTable("interpreting_doctors", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  
  // Address information
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  code: text("code"), // Postal/ZIP code
  
  // Professional credentials
  licenseNumber: text("license_number").notNull(), // Medical license number
  
  // Specialization
  primarySpecialty: interpretingSpecialtyEnum("primary_specialty").notNull(),
  secondarySpecialty: interpretingSpecialtyEnum("secondary_specialty"),
  
  // Reading/interpretation details
  readingStatus: readingStatusEnum("reading_status").default("active").notNull(),
  emergencyReads: boolean("emergency_reads").default(false).notNull(), // Available for emergency readings
  weekendReads: boolean("weekend_reads").default(false).notNull(), // Available for weekend readings
  nightReads: boolean("night_reads").default(false).notNull(), // Available for night readings
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
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
  // indexes for performance
  index("interpreting_doctors_email_idx").on(table.email),
  index("interpreting_doctors_phone_idx").on(table.phone),
  index("interpreting_doctors_name_idx").on(table.firstName, table.lastName),
  index("interpreting_doctors_license_idx").on(table.licenseNumber),
  index("interpreting_doctors_primary_specialty_idx").on(table.primarySpecialty),
  index("interpreting_doctors_secondary_specialty_idx").on(table.secondarySpecialty),
  index("interpreting_doctors_reading_status_idx").on(table.readingStatus),
  index("interpreting_doctors_emergency_reads_idx").on(table.emergencyReads),
  index("interpreting_doctors_is_active_idx").on(table.isActive),
  index("interpreting_doctors_deleted_at_idx").on(table.deletedAt),
  index("interpreting_doctors_created_by_idx").on(table.createdBy),
  index("interpreting_doctors_updated_by_idx").on(table.updatedBy),
]);
