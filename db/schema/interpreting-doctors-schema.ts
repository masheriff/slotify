import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references

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
});

// Create indexes for better performance
export const interpretingDoctorsEmailIdx = index("interpreting_doctors_email_idx").on(interpretingDoctors.email);
export const interpretingDoctorsPhoneIdx = index("interpreting_doctors_phone_idx").on(interpretingDoctors.phone);
export const interpretingDoctorsNameIdx = index("interpreting_doctors_name_idx").on(interpretingDoctors.firstName, interpretingDoctors.lastName);
export const interpretingDoctorsLicenseIdx = index("interpreting_doctors_license_idx").on(interpretingDoctors.licenseNumber);
export const interpretingDoctorsPrimarySpecialtyIdx = index("interpreting_doctors_primary_specialty_idx").on(interpretingDoctors.primarySpecialty);
export const interpretingDoctorsSecondarySpecialtyIdx = index("interpreting_doctors_secondary_specialty_idx").on(interpretingDoctors.secondarySpecialty);
export const interpretingDoctorsReadingStatusIdx = index("interpreting_doctors_reading_status_idx").on(interpretingDoctors.readingStatus);
export const interpretingDoctorsEmergencyReadsIdx = index("interpreting_doctors_emergency_reads_idx").on(interpretingDoctors.emergencyReads);
export const interpretingDoctorsIsActiveIdx = index("interpreting_doctors_is_active_idx").on(interpretingDoctors.isActive);
export const interpretingDoctorsDeletedAtIdx = index("interpreting_doctors_deleted_at_idx").on(interpretingDoctors.deletedAt);
export const interpretingDoctorsCreatedByIdx = index("interpreting_doctors_created_by_idx").on(interpretingDoctors.createdBy);
export const interpretingDoctorsUpdatedByIdx = index("interpreting_doctors_updated_by_idx").on(interpretingDoctors.updatedBy);