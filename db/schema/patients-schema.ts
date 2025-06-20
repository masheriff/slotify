import { pgTable, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references
import { ta } from "zod/v4/locales";

export const patients = pgTable("patients", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"), // Optional
  dateOfBirth: date("date_of_birth").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  code: text("code").notNull(), // Postal/ZIP code
  insuranceNumber: text("insurance_number"),
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
},(table) => [
  index("patients_email_idx").on(table.email),
  index("patients_phone_idx").on(table.phone),
  index("patients_name_idx").on(table.firstName, table.lastName),
  index("patients_insurance_idx").on(table.insuranceNumber),
  index("patients_deleted_at_idx").on(table.deletedAt),
  index("patients_created_by_idx").on(table.createdBy),
  index("patients_updated_by_idx").on(table.updatedBy),
  index("patients_date_of_birth_idx").on(table.dateOfBirth),
  index("patients_address_idx").on(table.addressLine1, table.addressLine2, table.state, table.city, table.code),

]);