import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references
import { table } from "console";

// Enums for better type safety and data consistency
export const entityTypeEnum = pgEnum("entity_type", [
  "hospital", 
  "clinic", 
  "medical_center", 
  "private_practice", 
  "urgent_care", 
  "laboratory", 
  "imaging_center", 
  "rehabilitation_center", 
  "surgical_center", 
  "emergency_department"
]);

export const departmentTypeEnum = pgEnum("department_type", [
  "emergency", 
  "radiology", 
  "cardiology", 
  "orthopedics", 
  "neurology", 
  "oncology", 
  "pediatrics", 
  "surgery", 
  "laboratory", 
  "pharmacy", 
  "administration", 
  "outpatient", 
  "inpatient", 
  "icu", 
  "maternity"
]);

// Referring Entity (Hospital, Clinic, Healthcare Organization, etc.)
export const referringEntities = pgTable("referring_entities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: entityTypeEnum("type").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  contactPersonName: text("contact_person_name"),
  contactPersonPhone: text("contact_person_phone"),
  contactPersonEmail: text("contact_person_email"),
  licenseNumber: text("license_number"), // Healthcare facility license
  taxId: text("tax_id"), // Tax identification number
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
}, (table) => [
  // Indexes for better performance
  index("referring_entities_name_idx").on(table.name),
  index("referring_entities_type_idx").on(table.type),
  index("referring_entities_is_active_idx").on(table.isActive),
  index("referring_entities_deleted_at_idx").on(table.deletedAt),
  index("referring_entities_license_idx").on(table.licenseNumber),
  index("referring_entities_tax_id_idx").on(table.taxId),
  index("referring_entities_created_by_idx").on(table.createdBy),
  index("referring_entities_updated_by_idx").on(table.updatedBy),
]);

// Referring Location (Physical locations/branches of referring entities)
export const referringLocations = pgTable("referring_locations", {
  id: text("id").primaryKey(),
  referringEntityId: text("referring_entity_id")
    .notNull()
    .references(() => referringEntities.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Main Campus", "Downtown Branch", "Emergency Department"
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  code: text("code").notNull(), // Postal/ZIP code
  country: text("country").notNull(),
  phone: text("phone"),
  fax: text("fax"),
  email: text("email"),
  departmentType: departmentTypeEnum("department_type"),
  operatingHours: text("operating_hours"), // e.g., "24/7", "Mon-Fri 8AM-5PM"
  isPrimary: boolean("is_primary").default(false).notNull(), // Is this the main location for the entity
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
}, (table) => [
  // Indexes for better performance
  index("referring_locations_entity_id_idx").on(table.referringEntityId),
  index("referring_locations_name_idx").on(table.name),
  index("referring_locations_city_state_idx").on(table.city, table.state),
  index("referring_locations_is_primary_idx").on(table.isPrimary),
  index("referring_locations_is_active_idx").on(table.isActive),
  index("referring_locations_deleted_at_idx").on(table.deletedAt),
  index("referring_locations_department_idx").on(table.departmentType),
  index("referring_locations_created_by_idx").on(table.createdBy),
  index("referring_locations_updated_by_idx").on(table.updatedBy),
]);