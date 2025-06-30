// types/page.types.ts - Page-specific prop interfaces

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