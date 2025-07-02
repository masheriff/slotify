// schemas/users.schemas.ts
import { z } from 'zod';
import { ADMIN_ORG_ROLES, CLIENT_ORG_ROLES } from '@/types/users.types';

// Base schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const organizationIdSchema = z
  .string()
  .min(1, 'Organization is required')
  .uuid('Invalid organization ID');

// Role schemas with proper enum validation
export const adminOrgRoleSchema = z.enum([
  ADMIN_ORG_ROLES.SYSTEM_ADMIN,
  ADMIN_ORG_ROLES.FIVE_AM_ADMIN,
  ADMIN_ORG_ROLES.FIVE_AM_AGENT,
] as const);

export const clientOrgRoleSchema = z.enum([
  CLIENT_ORG_ROLES.CLIENT_ADMIN,
  CLIENT_ORG_ROLES.FRONT_DESK,
  CLIENT_ORG_ROLES.TECHNICIAN,
  CLIENT_ORG_ROLES.INTERPRETING_DOCTOR,
] as const);

export const userRoleSchema = z.union([
  adminOrgRoleSchema,
  clientOrgRoleSchema,
]);

// User creation schema
export const userCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  organizationId: organizationIdSchema,
  role: userRoleSchema,
});

// User update schema (all fields optional except id)
export const userUpdateSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  organizationId: organizationIdSchema.optional(),
  role: userRoleSchema.optional(),
});

// User ban schema
export const userBanSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  banReason: z
    .string()
    .min(1, 'Ban reason is required')
    .min(10, 'Ban reason must be at least 10 characters')
    .max(500, 'Ban reason must not exceed 500 characters'),
  banExpires: z
    .date()
    .min(new Date(), 'Ban expiration must be in the future')
    .optional(),
});

// User unban schema
export const userUnbanSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// User impersonation schema
export const userImpersonateSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Search and filter schemas
export const userSearchSchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  organizationId: z.string().uuid().optional(),
  status: z.enum(['active', 'banned']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Form data schemas for client-side validation
export const userFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  organizationId: organizationIdSchema,
  role: userRoleSchema,
});

export const banFormSchema = z.object({
  banReason: z
    .string()
    .min(1, 'Ban reason is required')
    .min(10, 'Ban reason must be at least 10 characters')
    .max(500, 'Ban reason must not exceed 500 characters'),
  banExpires: z
    .date()
    .min(new Date(), 'Ban expiration must be in the future')
    .optional(),
});

// Role validation by organization type
export const validateRoleForOrganization = (role: string, orgType: 'admin' | 'client') => {
  if (orgType === 'admin') {
    return adminOrgRoleSchema.safeParse(role).success;
  } else {
    return clientOrgRoleSchema.safeParse(role).success;
  }
};

// Type exports for inference
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserBanInput = z.infer<typeof userBanSchema>;
export type UserUnbanInput = z.infer<typeof userUnbanSchema>;
export type UserImpersonateInput = z.infer<typeof userImpersonateSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
export type UserFormInput = z.infer<typeof userFormSchema>;
export type BanFormInput = z.infer<typeof banFormSchema>;