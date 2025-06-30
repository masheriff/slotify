import { Organization } from "./organization.types";

// types/member.types.ts
export interface MemberUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date | string;
  deletedAt: Date | string | null;
}

export interface MemberOrganization {
  id: string;
  name: string;
  slug: string | null;
}

// Base member interface from Better Auth
export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

// Member with user details for list display
export interface MemberListItem extends Member {
  user: MemberUser;
}

// Member with full details including organization
export interface MemberWithUser extends Member {
  user: MemberUser;
  organization: MemberOrganization;
}

// Member form data for creating/editing
export interface MemberFormData {
  email: string;
  role: string;
  name?: string;
}

// Member role options - matches healthcare permissions
export interface MemberRole {
  value: string;
  label: string;
  description?: string;
  organizationType?: "admin" | "client" | "both";
}

export const MEMBER_ROLES: MemberRole[] = [
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

// Member status for filtering
export type MemberStatus = "active" | "inactive";

export interface MemberFilters {
  role?: string;
  status?: MemberStatus;
  joinedAfter?: string;
}

export interface MemberDetails {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

export interface MemberDetailsContentProps {
  member: MemberDetails;
  organization: Organization;
  organizationId: string;
  memberId: string;
}

// Utility functions
export function getMemberRoleLabel(role: string): string {
  const roleConfig = MEMBER_ROLES.find(r => r.value === role);
  return roleConfig?.label || role;
}

export function getMemberRoleDescription(role: string): string {
  const roleConfig = MEMBER_ROLES.find(r => r.value === role);
  return roleConfig?.description || "";
}

export function getRolesForOrganizationType(orgType: "admin" | "client"): MemberRole[] {
  return MEMBER_ROLES.filter(role => 
    role.organizationType === orgType || role.organizationType === "both"
  );
}

export function getMemberStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? "bg-green-100 text-green-800 hover:bg-green-200" 
    : "bg-red-100 text-red-800 hover:bg-red-200";
}