import { pgTable, text, timestamp, index, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // Import users table for foreign key references

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
});

// Create indexes for referring entities
export const referringEntitiesNameIdx = index("referring_entities_name_idx").on(referringEntities.name);
export const referringEntitiesTypeIdx = index("referring_entities_type_idx").on(referringEntities.type);
export const referringEntitiesIsActiveIdx = index("referring_entities_is_active_idx").on(referringEntities.isActive);
export const referringEntitiesDeletedAtIdx = index("referring_entities_deleted_at_idx").on(referringEntities.deletedAt);
export const referringEntitiesLicenseIdx = index("referring_entities_license_idx").on(referringEntities.licenseNumber);

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
});

// Create indexes for referring locations
export const referringLocationsEntityIdIdx = index("referring_locations_entity_id_idx").on(referringLocations.referringEntityId);
export const referringLocationsNameIdx = index("referring_locations_name_idx").on(referringLocations.name);
export const referringLocationsCityStateIdx = index("referring_locations_city_state_idx").on(referringLocations.city, referringLocations.state);
export const referringLocationsIsPrimaryIdx = index("referring_locations_is_primary_idx").on(referringLocations.isPrimary);
export const referringLocationsIsActiveIdx = index("referring_locations_is_active_idx").on(referringLocations.isActive);
export const referringLocationsDeletedAtIdx = index("referring_locations_deleted_at_idx").on(referringLocations.deletedAt);
export const referringLocationsDepartmentIdx = index("referring_locations_department_idx").on(referringLocations.departmentType);