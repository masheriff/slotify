// types/organization.types.ts - CONSOLIDATED AND FIXED
export interface OrganizationMetadata {
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
  isActive: boolean;
  settings: {
    features?: {
      multiTenant?: boolean;
      advancedReporting?: boolean;
      apiAccess?: boolean;
      customBranding?: boolean;
    };
    billing?: {
      plan?: string;
      status?: string;
    };
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
  };
  hipaaOfficer?: string;
  businessAssociateAgreement?: boolean;
  dataRetentionYears?: string;
}

// Base organization interface
export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  metadata: OrganizationMetadata;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// For table display - matches your DataTable expectations
export interface OrganizationTableRow {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  metadata: OrganizationMetadata;
}

// For list item display - flattened structure used in your page.tsx
export interface OrganizationListItem {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  type: "admin" | "client";
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Form data interface
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

// Organization with members for detailed views
export interface OrganizationWithMembers extends Organization {
  members: Array<{
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
  }>;
  memberCount: number;
}