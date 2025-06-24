// types/table-config.types.ts - Updated organization types
export interface OrganizationColumns {
  id: string
  name: string
  logo?: string
  createdAt: string
  slug?: string
  metadata?: Record<string, any>
}

// types/organization.types.ts - Comprehensive organization types
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