// types/auth.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  impersonatedBy?: string;
  activeOrganizationId?: string;
}

export interface SessionData {
  user: User;
  session: Session;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  metadata: OrganizationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

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
  settings: OrganizationSettings;
  hipaaOfficer?: string;
  businessAssociateAgreement?: boolean;
  dataRetentionYears?: string;
}

export interface OrganizationSettings {
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
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role?: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
  updatedAt: Date;
}