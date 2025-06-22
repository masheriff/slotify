import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  unique,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

// Enums for better type safety
export const organizationTypeEnum = pgEnum("organization_type", [
  "admin",
  "client",
]);
export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "inactive",
  "pending",
]);
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);
export const actionTypeEnum = pgEnum("action_type", [
  "CREATE",
  "READ",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
]);

// Better Auth core tables (kept minimal for compatibility)
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    role: text("role"),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_banned_idx").on(table.banned),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_token_idx").on(table.token),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_active_org_idx").on(table.activeOrganizationId),
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_idx").on(table.providerId, table.accountId),
  ]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
  },
  (table) => [
    index("verifications_identifier_idx").on(table.identifier),
    index("verifications_expires_at_idx").on(table.expiresAt),
  ]
);

// Organizations table with metadata for custom fields
export const organizations = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    
    // All custom fields moved to metadata as JSON
    metadata: jsonb("metadata").default({}).notNull(),
    // metadata will contain:
    // {
    //   type: "admin" | "client",
    //   contactEmail: string,
    //   contactPhone: string,
    //   addressLine1: string,
    //   addressLine2: string,
    //   city: string,
    //   state: string,
    //   postalCode: string,
    //   country: string,
    //   timezone: string,
    //   isActive: boolean,
    //   settings: object,
    //   hipaaOfficer: string,
    //   businessAssociateAgreement: boolean,
    //   dataRetentionYears: string
    // }

    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("org_slug_idx").on(table.slug),
    // Index on metadata fields for performance
    index("org_metadata_type_idx").using("gin", table.metadata),
  ]
);

// Minimal members table for Better Auth compatibility
export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    unique("user_org_unique").on(table.userId, table.organizationId),
    index("members_user_id_idx").on(table.userId),
    index("members_org_id_idx").on(table.organizationId),
    index("members_role_idx").on(table.role),
  ]
);


export const invitations = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: invitationStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invitations_email_idx").on(table.email),
    index("invitations_org_id_idx").on(table.organizationId),
    index("invitations_status_idx").on(table.status),
    index("invitations_expires_at_idx").on(table.expiresAt),
  ]
);

// HIPAA Audit logs for compliance
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    organizationId: text("organization_id").references(() => organizations.id),
    action: actionTypeEnum("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("audit_user_id_idx").on(table.userId),
    index("audit_org_id_idx").on(table.organizationId),
    index("audit_created_at_idx").on(table.createdAt),
    index("audit_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_action_idx").on(table.action),
  ]
);


// Add new table to auth-schema.ts
export const auditCleanupLogs = pgTable("audit_cleanup_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organizations.id),
  deletedRecords: integer("deleted_records").notNull(),
  retentionYears: integer("retention_years").notNull(),
  cleanupDate: timestamp("cleanup_date").$defaultFn(() => new Date()).notNull(),
  jobStartTime: timestamp("job_start_time").notNull(),
  jobEndTime: timestamp("job_end_time").notNull(),
  status: text("status").notNull(), // 'success', 'failed', 'partial'
  errorMessage: text("error_message"),
}, (table) => [
  index("cleanup_logs_org_idx").on(table.organizationId),
  index("cleanup_logs_date_idx").on(table.cleanupDate),
]);

// User preferences for multi-org support
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    defaultOrganizationId: text("default_organization_id").references(
      () => organizations.id
    ),
    preferences: jsonb("preferences").default({}),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("user_preferences_user_id_idx").on(table.userId)]
);