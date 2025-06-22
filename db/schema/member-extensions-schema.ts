// db/schema/member-extensions-schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations, users, members } from "./auth-schema";

/**
 * Member extensions table to handle additional member-specific data
 * This table extends the base members table with custom attributes
 */
export const memberExtensions = pgTable(
  "member_extensions",
  {
    id: text("id").primaryKey(),
    memberId: text("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    
    // Agent-specific assignments
    assignedOrganizations: jsonb("assigned_organizations").default([]).notNull(), // Array of organization IDs
    
    // Front desk-specific assignments
    assignedLocationIds: jsonb("assigned_location_ids").default([]).notNull(), // Array of location IDs
    
    // Technician and Doctor availability settings
    availabilitySettings: jsonb("availability_settings").default({}).notNull(),
    
    // Additional metadata for role-specific configurations
    roleSpecificData: jsonb("role_specific_data").default({}).notNull(),
    
    // Status and activation
    isActive: boolean("is_active").default(true).notNull(),
    
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
  },
  (table) => [
    index("member_extensions_member_id_idx").on(table.memberId),
    index("member_extensions_user_id_idx").on(table.userId),
    index("member_extensions_organization_id_idx").on(table.organizationId),
    index("member_extensions_is_active_idx").on(table.isActive),
    index("member_extensions_created_by_idx").on(table.createdBy),
    index("member_extensions_updated_by_idx").on(table.updatedBy),
  ]
);

/**
 * Agent organization assignments table
 * Tracks which client organizations each agent can access
 */
export const agentOrganizationAssignments = pgTable(
  "agent_organization_assignments",
  {
    id: text("id").primaryKey(),
    agentUserId: text("agent_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    agentOrganizationId: text("agent_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // 5AM Corp
    clientOrganizationId: text("client_organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // Hart Medical, etc.
    
    // Permission level for this assignment
    accessLevel: text("access_level").default("standard").notNull(), // standard, limited, full
    
    // Assignment status
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at")
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: timestamp("expires_at"), // Optional expiration
    
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
  },
  (table) => [
    index("agent_assignments_agent_user_idx").on(table.agentUserId),
    index("agent_assignments_agent_org_idx").on(table.agentOrganizationId),
    index("agent_assignments_client_org_idx").on(table.clientOrganizationId),
    index("agent_assignments_is_active_idx").on(table.isActive),
    index("agent_assignments_assigned_at_idx").on(table.assignedAt),
    index("agent_assignments_expires_at_idx").on(table.expiresAt),
  ]
);

/**
 * Front desk location assignments table
 * Tracks which procedure test locations each front desk user can access
 */
export const frontDeskLocationAssignments = pgTable(
  "front_desk_location_assignments",
  {
    id: text("id").primaryKey(),
    frontDeskUserId: text("front_desk_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    procedureLocationId: text("procedure_location_id").notNull(), // Reference to procedure_test_locations
    
    // Access permissions for this location
    canManageBookings: boolean("can_manage_bookings").default(true).notNull(),
    canViewAllBookings: boolean("can_view_all_bookings").default(true).notNull(),
    canAssignTechnicians: boolean("can_assign_technicians").default(true).notNull(),
    
    // Assignment status
    isActive: boolean("is_active").default(true).notNull(),
    assignedAt: timestamp("assigned_at")
      .$defaultFn(() => new Date())
      .notNull(),
    
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
  },
  (table) => [
    index("front_desk_assignments_user_idx").on(table.frontDeskUserId),
    index("front_desk_assignments_org_idx").on(table.organizationId),
    index("front_desk_assignments_location_idx").on(table.procedureLocationId),
    index("front_desk_assignments_is_active_idx").on(table.isActive),
  ]
);

/**
 * Type definitions for member extension data
 */
export type MemberExtensionData = {
  assignedOrganizations: string[];
  assignedLocationIds: string[];
  availabilitySettings: {
    weekdayHours?: {
      start: string;
      end: string;
    };
    weekendHours?: {
      start: string;
      end: string;
    };
    emergencyAvailable?: boolean;
    maxConcurrentAssignments?: number;
  };
  roleSpecificData: Record<string, any>;
};

export type AgentOrganizationAssignment = {
  id: string;
  agentUserId: string;
  agentOrganizationId: string;
  clientOrganizationId: string;
  accessLevel: "standard" | "limited" | "full";
  isActive: boolean;
  assignedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type FrontDeskLocationAssignment = {
  id: string;
  frontDeskUserId: string;
  organizationId: string;
  procedureLocationId: string;
  canManageBookings: boolean;
  canViewAllBookings: boolean;
  canAssignTechnicians: boolean;
  isActive: boolean;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};