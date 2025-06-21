import { pgTable, text, timestamp, index, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { organizations, users } from "./auth-schema"; // Import users table for foreign key references
import { patients } from "./patients-schema"; // Import patients table
import { table } from "console";

// Device status enum
export const deviceStatusEnum = pgEnum("device_status", [
  "available",      // Ready for patient assignment
  "assigned",       // Assigned to an appointment
  "in_use",        // Patient is actively wearing it
  "returned",      // Returned from patient, needs processing
  "maintenance",   // Under repair or calibration
  "cleaning",      // Being cleaned/sterilized
  "out_of_service" // Broken or retired
]);

// Device type/model enum
export const holterTypeEnum = pgEnum("holter_type", [
  "24_hour",
  "48_hour", 
  "72_hour",
  "7_day",
  "14_day",
  "30_day",
  "event_monitor",
  "patch_monitor"
]);

// Holter Devices inventory table
export const holterDevices = pgTable("holter_devices", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
  .notNull()
  .references(() => organizations.id),
  serialNumber: text("serial_number").notNull().unique(),
  manufacturer: text("manufacturer").notNull(), // e.g., "Philips", "GE", "Spacelabs"
  model: text("model").notNull(), // e.g., "DigiTrak XT", "SEER 1000"
  holterType: holterTypeEnum("holter_type").notNull(),
  
  // Current assignment
  status: deviceStatusEnum("status").default("available").notNull(),
  currentPatientId: text("current_patient_id").references(() => patients.id),
  assignedDate: date("assigned_date"), // When assigned to current patient
  expectedReturnDate: date("expected_return_date"), // When patient should return device
  
  // Device details
  batteryLevel: text("battery_level"), // e.g., "100%", "Low", "Critical"
  lastCalibration: date("last_calibration"),
  nextMaintenanceDate: date("next_maintenance_date"),
  
  // Purchase/warranty info
  purchaseDate: date("purchase_date"),
  warrantyExpiration: date("warranty_expiration"),
  
  // Notes
  notes: text("notes"), // Any special notes about the device
  
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
  // Indexes for performance
  index("holter_devices_organization_id_idx").on(table.organizationId),
  index("holter_devices_serial_idx").on(table.serialNumber),
  index("holter_devices_status_idx").on(table.status),
  index("holter_devices_current_patient_idx").on(table.currentPatientId),
  index("holter_devices_type_idx").on(table.holterType),
  index("holter_devices_manufacturer_idx").on(table.manufacturer),
  index("holter_devices_assigned_date_idx").on(table.assignedDate),
  index("holter_devices_expected_return_idx").on(table.expectedReturnDate),
  index("holter_devices_is_active_idx").on(table.isActive),
  index("holter_devices_deleted_at_idx").on(table.deletedAt),
  index("holter_devices_created_by_idx").on(table.createdBy),
  index("holter_devices_updated_by_idx").on(table.updatedBy),
]);