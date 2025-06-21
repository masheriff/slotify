import { pgTable, text, timestamp, index, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth-schema"; // Import users table for foreign key references

// Enums for procedure/test location types
export const procedureLocationTypeEnum = pgEnum("procedure_location_type", [
  "imaging_center",
  "laboratory", 
  "surgery_center",
  "hospital",
  "clinic",
  "outpatient_facility",
  "radiology_center",
  "cardiac_center",
  "endoscopy_center",
  "dialysis_center",
  "rehabilitation_center",
  "sleep_center",
  "pain_management_center"
]);

export const procedureCategoryEnum = pgEnum("procedure_category", [
  "imaging",
  "laboratory",
  "surgical",
  "diagnostic",
  "therapeutic",
  "screening",
  "interventional",
  "rehabilitation",
  "emergency"
]);

export const facilitySpecialtyEnum = pgEnum("facility_specialty", [
  "mri",
  "ct_scan",
  "ultrasound",
  "x_ray",
  "mammography",
  "nuclear_medicine",
  "pet_scan",
  "bone_density",
  "echocardiogram",
  "stress_testing",
  "blood_work",
  "urine_analysis",
  "biopsy",
  "endoscopy",
  "colonoscopy",
  "ekg",
  "holter_monitoring",
  "sleep_study",
  "physical_therapy",
  "occupational_therapy",
  "dialysis",
  "chemotherapy",
  "radiation_therapy"
]);


// Master table for procedure/test locations
export const procedureTestLocations = pgTable("procedure_test_locations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
  .notNull()
  .references(() => organizations.id),
  name: text("name").notNull(),
  type: procedureLocationTypeEnum("type").notNull(),
  category: procedureCategoryEnum("category"),
  phone: text("phone"),
  fax: text("fax"),
  email: text("email"),
  website: text("website"),
  
  // Address information
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  code: text("code").notNull(), // Postal/ZIP code
  country: text("country").notNull(),
  
  // Business details
  licenseNumber: text("license_number"), // Facility license
  
  // Operational details
  operatingHours: text("operating_hours"), // e.g., "Mon-Fri 7AM-7PM, Sat 8AM-4PM"
  
  // Contact and coordination
  contactPersonName: text("contact_person_name"),
  contactPersonPhone: text("contact_person_phone"),
  contactPersonEmail: text("contact_person_email"),
  schedulingPhone: text("scheduling_phone"), // Dedicated scheduling line
  schedulingEmail: text("scheduling_email"),
  
  // Special capabilities
  specialEquipment: text("special_equipment"), // e.g., "3T MRI", "PET/CT", "Da Vinci Robot"
  specialties: jsonb("specialties").default([]), // Array of facility specialties
  notes: text("notes"), // Additional information
  
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
  index("procedure_test_locations_organization_id_idx").on(table.organizationId),
  index("procedure_test_locations_name_idx").on(table.name),
  index("procedure_test_locations_type_idx").on(table.type),
  index("procedure_test_locations_category_idx").on(table.category),
  index("procedure_test_locations_city_state_idx").on(table.city, table.state),
  index("procedure_test_locations_is_active_idx").on(table.isActive),
  index("procedure_test_locations_deleted_at_idx").on(table.deletedAt),
  index("procedure_test_locations_license_idx").on(table.licenseNumber),
  index("procedure_test_locations_created_by_idx").on(table.createdBy),
  index("procedure_test_locations_updated_by_idx").on(table.updatedBy),
]);