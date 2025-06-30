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