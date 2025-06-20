import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references
import { facilitySpecialtyEnum } from "./procedure-test-locations-schema"; // Import specialty enum
import { ta } from "zod/v4/locales";

// Technician certification level enum
export const certificationLevelEnum = pgEnum("certification_level", [
  "entry_level",
  "certified", 
  "advanced",
  "specialist",
  "lead",
  "supervisor"
]);

// Technician employment status enum
export const employmentStatusEnum = pgEnum("employment_status", [
  "full_time",
  "part_time", 
  "contract",
  "per_diem",
  "temp"
]);

// Technicians table
export const technicians = pgTable("technicians", {
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
  
  // Professional details
  licenseNumber: text("license_number"), // Professional license/certification number
  specialty: facilitySpecialtyEnum("specialty").notNull(), // Reuse from procedure locations
  certificationLevel: certificationLevelEnum("certification_level").default("entry_level").notNull(),
  employmentStatus: employmentStatusEnum("employment_status").default("full_time").notNull(),
  
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
  // Indexes for better performance
  index("technicians_email_idx").on(table.email),
  index("technicians_phone_idx").on(table.phone),
  index("technicians_name_idx").on(table.firstName, table.lastName),
  index("technicians_specialty_idx").on(table.specialty),
  index("technicians_certification_idx").on(table.certificationLevel),
  index("technicians_employment_status_idx").on(table.employmentStatus),
  index("technicians_license_idx").on(table.licenseNumber),
  index("technicians_is_active_idx").on(table.isActive),
  index("technicians_deleted_at_idx").on(table.deletedAt),
  index("technicians_created_by_idx").on(table.createdBy),
  index("technicians_updated_by_idx").on(table.updatedBy),
]);