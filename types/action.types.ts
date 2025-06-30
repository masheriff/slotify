import { OrganizationInput } from "@/schemas";
import { OrganizationMetadata } from "./organization.types";

// Member action parameters
export interface GetMembersListParams {
  organizationId: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  status?: string;
  joinedAfter?: string;
}

export interface InviteUserToOrganizationParams {
  organizationId: string;
  email: string;
  role: string;
  name?: string;
}

export interface UpdateMemberRoleParams {
  memberId: string;
  role: string;
}

// Organization action parameters
export interface ListOrganizationsParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  type?: string;
  status?: string;
  contactEmail?: string;
  createdAfter?: string;
}

export interface UpdateOrganizationParams {
  organizationId: string;
  data: OrganizationInput;
}

export interface CreateOrganizationParams {
  name: string;
  slug: string;
  type: "admin" | "client";
  metadata: Partial<OrganizationMetadata>;
}

// Invitation action parameters
export interface GetOrganizationInvitationsParams {
  organizationId: string;
  page: number;
  pageSize: number;
}

export interface CancelInvitationParams {
  invitationId: string;
}

// Permission check parameters
export interface ValidateAccessParams {
  organizationId: string;
  resource: string;
  action: string;
  resourceId?: string;
}

// Audit log parameters
export interface GetAuditLogsParams {
  organizationId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

// File upload parameters
export interface UploadFileParams {
  file: File;
  organizationId?: string;
  category?: "logo" | "document" | "general";
}

// Bulk operations
export interface BulkMemberOperationParams {
  memberIds: string[];
  operation: "activate" | "deactivate" | "delete" | "change_role";
  newRole?: string;
}

export interface BulkOrganizationOperationParams {
  organizationIds: string[];
  operation: "activate" | "deactivate" | "archive";
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ExistingMetadata {
  type?: string;
  isActive?: boolean;
  [key: string]: any;
}
