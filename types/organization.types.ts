// types/organization.types.ts - Organization-specific types (avoiding conflicts)
import { Organization, OrganizationMetadata } from './auth.types'

// Organization type for table display - extending the base Organization type
export interface OrganizationTableRow extends Organization {
  // All properties are inherited from Organization
}

export interface OrganizationFormData {
  name: string;
  slug: string;
  logo?: string;
  type: "admin" | "client";
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  timezone: string;
  hipaaOfficer?: string;
  dataRetentionYears: string;
  businessAssociateAgreement: boolean;
}

// Re-export the types from auth.types to avoid conflicts
export type { Organization, OrganizationMetadata } from './auth.types'