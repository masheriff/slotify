// types/page.types.ts - Page-specific prop interfaces

// Base page props for organization-scoped pages
export interface BasePageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

// Common list page search params
export interface ListPageSearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Organizations page props
export interface OrganizationsPageProps {
  searchParams: Promise<ListPageSearchParams & {
    type?: string;
    createdAfter?: string;
    status?: string;
    contactEmail?: string;
  }>;
}

// Organization members page props
export interface MembersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<ListPageSearchParams & {
    type?: string;
    createdAfter?: string;
    status?: string;
    contactEmail?: string;
  }>;
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

// Generic list page props with filters
export interface GenericListPageProps<T = Record<string, string | undefined>> {
  searchParams: Promise<ListPageSearchParams & T>;
}