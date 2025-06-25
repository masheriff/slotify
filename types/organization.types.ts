// types/organization.types.ts - Organization types for components
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

// Organization type for table display
export interface OrganizationTableRow {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  createdAt: Date | string;
  metadata: OrganizationMetadata;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  metadata: OrganizationMetadata;
  createdAt: Date;
  updatedAt?: Date;
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

export interface OrganizationWithMembers extends Organization {
  members: Array<{
    id: string;
    userId: string;
    role: string;
    createdAt: Date;
  }>;
  memberCount: number;
}
