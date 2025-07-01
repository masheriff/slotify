// types/user.types.ts
export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  organization: string; // Organization name
  organizationType?: "admin" | "client";
  status: "active" | "banned";
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  emailVerified: boolean;
}

export interface UserWithOrganization {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  emailVerified: boolean;
  organization: {
    id: string;
    name: string;
    slug: string | null;
    type: "admin" | "client";
  };
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  organizationId?: string;
}

export interface UserFilters {
  role?: string;
  status?: "active" | "banned";
  organization?: string;
  organizationType?: "admin" | "client";
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface GetUsersListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  status?: string;
  organization?: string;
  organizationType?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

// User role options - matches healthcare permissions
export interface UserRole {
  value: string;
  label: string;
  description?: string;
  organizationType?: "admin" | "client" | "both";
}

export const USER_ROLES: UserRole[] = [
  // 5AM Corp (Admin Organization) Roles
  {
    value: "system_admin",
    label: "System Admin",
    description: "Full platform administration access",
    organizationType: "admin",
  },
  {
    value: "five_am_admin",
    label: "5AM Admin",
    description: "Organization management without user impersonation",
    organizationType: "admin",
  },
  {
    value: "five_am_agent",
    label: "5AM Agent",
    description: "Limited access to assigned client organizations",
    organizationType: "admin",
  },
  
  // Client Organization Roles
  {
    value: "client_admin",
    label: "Client Admin",
    description: "Client organization admin managing facility operations",
    organizationType: "client",
  },
  {
    value: "front_desk",
    label: "Front Desk",
    description: "Patient scheduling and check-in management",
    organizationType: "client",
  },
  {
    value: "technician",
    label: "Technician",
    description: "Procedure execution and device management",
    organizationType: "client",
  },
  {
    value: "interpreting_doctor",
    label: "Interpreting Doctor",
    description: "Medical interpretation and report review",
    organizationType: "client",
  },
];

// User status type
export type UserStatus = "active" | "banned";