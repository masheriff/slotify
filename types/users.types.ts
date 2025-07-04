// types/users.types.ts
import { User } from 'better-auth';
import { Member } from 'better-auth/plugins';

// User role constants for type safety
export const ADMIN_ORG_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  FIVE_AM_ADMIN: 'five_am_admin',
  FIVE_AM_AGENT: 'five_am_agent',
} as const;

export const CLIENT_ORG_ROLES = {
  CLIENT_ADMIN: 'client_admin',
  FRONT_DESK: 'front_desk',
  TECHNICIAN: 'technician',
  INTERPRETING_DOCTOR: 'interpreting_doctor',
} as const;

export type AdminOrgRole = typeof ADMIN_ORG_ROLES[keyof typeof ADMIN_ORG_ROLES];
export type ClientOrgRole = typeof CLIENT_ORG_ROLES[keyof typeof CLIENT_ORG_ROLES];
export type UserRole = AdminOrgRole | ClientOrgRole;

// User List Item for data tables (matches other modules pattern)
export interface UserListItem {
  id: string;
  image: string | null;
  name: string | null;
  email: string;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  organization?: {
    id: string;
    name: string;
    slug: string | null;
    type: 'admin' | 'client';
  } | null;
  member?: {
    id: string;
    role: string;
    createdAt: Date;
  } | null;
}

// Form data schemas
export interface UserCreateData {
  name: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export interface UserUpdateData {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  organizationId?: string;
}

export interface UserBanData {
  id: string;
  banReason: string;
  banExpires?: Date;
}

// Extended user type for utility functions
export interface ExtendedUser {
  id: string;
  name: string | null;
  email: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

// User permissions interface
export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canBan: boolean;
  canImpersonate: boolean;
  canViewAll: boolean;
}

// Organization with type for role filtering
export interface OrganizationWithType {
  id: string;
  name: string;
  slug: string | null;
  metadata: {
    type: 'admin' | 'client';
    [key: string]: any;
  };
}

// Component interfaces
export interface UserFormProps {
  mode: 'create' | 'edit';
  userId?: string;
  onSuccess?: () => void;
  initialData?: Partial<UserCreateData>;
}

export interface BanUserDialogProps {
  user: ExtendedUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface UserActionsProps {
  user: ExtendedUser;
  currentUserRole: UserRole;
  onUserUpdate?: () => void;
}

// List parameters for getUsersList
export interface GetUsersListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  role?: string;
  organizationId?: string;
  status?: 'active' | 'banned';
  createdAfter?: string; 
}

// Organization with type for role filtering
export interface OrganizationOption {
  id: string;
  name: string;
  slug: string | null;
  type: 'admin' | 'client';
}