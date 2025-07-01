// types/user.types.ts - User management types
import { z } from "zod";
import { createUserSchema, updateUserSchema, userRoleSchema } from "@/schemas/user.schemas";

// Base user types from schema
export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Database user record type
export interface User {
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
}

// User with organization membership info
export interface UserWithMembership extends User {
  role?: string;
  organizationId?: string;
  organizationName?: string;
  membershipCreatedAt?: Date | string;
}

// User list item for data tables
export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  // Primary membership info (users can have multiple memberships)
  primaryRole?: string;
  primaryOrganizationId?: string;
  primaryOrganizationName?: string;
  // Count of total memberships
  membershipCount: number;
}

// Detailed user info with all memberships and professional details
export interface UserDetails extends UserListItem {
  memberships: UserMembership[];
  technicianProfile?: TechnicianProfile;
  interpretingDoctorProfile?: InterpretingDoctorProfile;
}

// User membership in organizations
export interface UserMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string | null;
  role: string;
  createdAt: Date | string;
  isActive: boolean;
}

// Professional profile types
export interface TechnicianProfile {
  id: string;
  organizationId: string;
  userId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  code: string | null;
  licenseNumber: string | null;
  specialty: string;
  certificationLevel: string;
  employmentStatus: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InterpretingDoctorProfile {
  id: string;
  organizationId: string;
  userId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  code: string | null;
  licenseNumber: string;
  primarySpecialty: string;
  secondarySpecialty: string | null;
  readingStatus: string;
  emergencyReads: boolean;
  weekendReads: boolean;
  nightReads: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Server action parameters
export interface GetUsersListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  role?: string;
  status?: "active" | "banned" | "all";
  organization?: string;
  organizationType?: "admin" | "client";
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface GetUserByIdParams {
  userId: string;
  includeInactive?: boolean;
}

export interface CreateUserParams {
  userData: CreateUserInput;
  sendInvitation?: boolean;
}

export interface UpdateUserParams {
  userId: string;
  userData: Partial<UpdateUserInput>;
}

export interface BanUserParams {
  userId: string;
  banReason: string;
  banExpires?: Date;
}

export interface UnbanUserParams {
  userId: string;
}

// Form component props
export interface UserFormProps {
  mode: "create" | "edit";
  userId?: string;
  organizationId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface UserFormSectionProps {
  mode: "create" | "edit";
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

// Detail page component props
export interface UserDetailsContentProps {
  user: UserDetails;
  userId: string;
  canEdit?: boolean;
  canBan?: boolean;
  canDelete?: boolean;
}

export interface UserMembershipsTableProps {
  memberships: UserMembership[];
  userId: string;
  canManageMemberships?: boolean;
}

export interface UserProfessionalProfileProps {
  technicianProfile?: TechnicianProfile;
  interpretingDoctorProfile?: InterpretingDoctorProfile;
  userId: string;
  canEdit?: boolean;
}

// Security management props
export interface UserSecuritySectionProps {
  user: User;
  canBan?: boolean;
  canVerifyEmail?: boolean;
  onSecurityUpdate?: (updates: Partial<User>) => void;
}

// Activity and audit props
export interface UserActivityLogProps {
  userId: string;
  organizationId?: string;
  limit?: number;
}

// Filter configuration for user list
export interface UserFilterConfig {
  roles: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
  organizationTypes: Array<{ value: string; label: string }>;
}

// Professional details union type for form handling
export type ProfessionalDetails = TechnicianProfile | InterpretingDoctorProfile;

// User creation result
export interface UserCreationResult {
  user: User;
  member: UserMembership;
  professionalProfile?: TechnicianProfile | InterpretingDoctorProfile;
  invitationSent: boolean;
}

// User list filter state
export interface UserListFilters {
  role?: string;
  status?: string;
  organization?: string;
  organizationType?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}