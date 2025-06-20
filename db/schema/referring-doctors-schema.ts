import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references

// Master table for medical specialties
export const specialties = pgTable("specialties", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  deletedBy: text("deleted_by").references(() => users.id),
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

// Create indexes for specialties
export const specialtiesNameIdx = index("specialties_name_idx").on(specialties.name);
export const specialtiesIsActiveIdx = index("specialties_is_active_idx").on(specialties.isActive);
export const specialtiesDeletedAtIdx = index("specialties_deleted_at_idx").on(specialties.deletedAt);

export const referringDoctors = pgTable("referring_doctors", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  phone: text("phone"), // Now optional
  email: text("email"), // Optional
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  code: text("code").notNull(), // Postal/ZIP code
  licenseNumber: text("license_number"), // Medical license number
  specialtyId: text("specialty_id").references(() => specialties.id), // Reference to specialties master
  deletedAt: timestamp("deleted_at"),
  deletedBy: text("deleted_by").references(() => users.id),
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
export const referringDoctorsEmailIdx = index("referring_doctors_email_idx").on(referringDoctors.email);
export const referringDoctorsPhoneIdx = index("referring_doctors_phone_idx").on(referringDoctors.phone);
export const referringDoctorsNameIdx = index("referring_doctors_name_idx").on(referringDoctors.firstName, referringDoctors.lastName);
export const referringDoctorsLicenseIdx = index("referring_doctors_license_idx").on(referringDoctors.licenseNumber);
export const referringDoctorsSpecialtyIdIdx = index("referring_doctors_specialty_id_idx").on(referringDoctors.specialtyId);
export const referringDoctorsDeletedAtIdx = index("referring_doctors_deleted_at_idx").on(referringDoctors.deletedAt);
export const referringDoctorsCreatedByIdx = index("referring_doctors_created_by_idx").on(referringDoctors.createdBy);
export const referringDoctorsUpdatedByIdx = index("referring_doctors_updated_by_idx").on(referringDoctors.updatedBy);