import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";

export interface SeedUser {
  email: string;
  name: string;
  role: (typeof HEALTHCARE_ROLES)[keyof typeof HEALTHCARE_ROLES];
  password?: string;
}

export interface SeedOrganization {
  name: string;
  slug: string;
  type: "admin" | "client";
  logo?: string;
  metadata: {
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
    settings: Record<string, any>;
    hipaaOfficer?: string;
    businessAssociateAgreement?: boolean;
    dataRetentionYears?: string;
  };
  users: SeedUser[];
}