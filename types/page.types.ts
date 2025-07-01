// types/page.types.ts - Page-specific prop interfaces

import { LucideIcon } from "lucide-react";
import { Organization } from "./organization.types";

// Base page props for organization-scoped pages
export interface BasePageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

// Organizations page props - compatible with parseListParams
export interface OrganizationsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

// Organization members page props - compatible with parseListParams
export interface MembersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

// Edit organization page props
export interface EditOrganizationPageProps {
  params: Promise<{ id: string }>;
}

// Edit member page props
export interface EditMemberPageProps {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
}

export interface InviteMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface OrganizationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export interface EditOrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface OrganizationDetailsContentProps {
  organization: Organization; // Type this according to your organization type
  organizationId: string;
}

export interface EditMemberPageProps {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
}

export interface MemberDetailsPageProps {
  params: Promise<{ id: string; memberId: string }>;
}

// Generic detail page props
export interface DetailPageProps {
  params: Promise<{ id: string }>;
}

// Generic list page props - flexible for any list page
export interface GenericListPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

// Specific search param types for documentation (not used in components)
export interface OrganizationSearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  type?: string;
  createdAfter?: string;
  status?: string;
  contactEmail?: string;
}

export interface MemberSearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  role?: string;
  status?: string;
  joinedAfter?: string;
}


export interface DetailsPageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  loadingKey?: string;
  loadingText?: string;
}

export interface DetailsPageHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: {
    src?: string;
    fallback: string;
  };
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  }>;
  breadcrumbItems: Array<{
    title: string;
    href?: string;
  }>;
  actions?: DetailsPageHeaderAction[];
  onBack?: () => void;
  backLabel?: string;
}

export interface UsersPageProps {
  params: Promise<{ id: string }>;
}