// types/api.types.ts

import { OrganizationMetadata } from "./auth.types";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  type: "admin" | "client";
  metadata: Partial<OrganizationMetadata>;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: Partial<OrganizationMetadata>;
}

export interface InviteUserRequest {
  email: string;
  role: string;
  organizationId: string;
}

export interface HasPermissionRequest {
  organizationId: string;
  resource: string;
  action: string;
  resourceId?: string;
}

export interface SetUserRoleRequest {
  userId: string;
  role: string;
  organizationId?: string;
}