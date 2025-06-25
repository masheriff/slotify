// app/admin/organizations/page.tsx - FIXED VERSION
import { Metadata } from "next";
import { 
  parseListParams, 
  fetchListData, 
  handleListPageRedirect,
  buildCanonicalListURL,
  logListPageMetrics,
  validateListPageAccess 
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/components/table-configs/organization-columns";
import { organizationFilterConfig } from "@/components/admin/forms/organization-filters-config";
import { listOrganizations, OrganizationData } from "@/actions/organization-actions";
import { getCurrentUser } from "@/lib/auth-server";
import { OrganizationListItem } from "@/types";

interface OrganizationsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    type?: string;
    createdAfter?: string;
    status?: string;
    contactEmail?: string;
  }>;
}

// Configuration for this list page
const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: 'name',
  defaultSortDirection: 'asc' as const,
  maxPageSize: 100,
  allowedSortColumns: ['name', 'createdAt', 'type', 'city', 'state'],
  searchable: true,
  exportable: true,
};

export default async function OrganizationsPage({
  searchParams,
}: OrganizationsPageProps) {
  const startTime = Date.now();
  
  try {
    // Parse and validate parameters
    const params = await parseListParams(searchParams, LIST_CONFIG);
    
    // Check user permissions
    const user = await getCurrentUser();
    const accessCheck = await validateListPageAccess('organizations', 'read', user);
    
    if (!accessCheck.success) {
      return (
        <ListPageWrapper 
          error={accessCheck.error || 'Access denied'}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Organizations', current: true },
          ]}
        />
      );
    }

    // Fetch organizations data - this returns Better Auth Organization[] with metadata
    const result = await fetchListData<OrganizationData>(
      listOrganizations,
      params,
      { module: 'organizations', user }
    );

    // Handle fetch errors
    if (!result.success || !result.data) {
      return (
        <ListPageWrapper 
          error={result.error || 'Failed to load organizations'}
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Organizations', current: true },
          ]}
        />
      );
    }

    // Handle page redirects for invalid states
    handleListPageRedirect('/admin/organizations', params, result.data.totalPages);

    // Transform Better Auth Organization data to OrganizationListItem format
    const tableData: OrganizationListItem[] = result.data.data.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug || '',
      type: org.metadata?.type || 'client',
      contactEmail: org.metadata?.contactEmail || '',
      contactPhone: org.metadata?.contactPhone || '',
      city: org.metadata?.city || '',
      state: org.metadata?.state || '',
      isActive: org.metadata?.isActive ?? true,
      createdAt: org.createdAt,
      logo: org.logo,
      status: org.metadata?.status || 'active', // Add status property with a sensible default
    }));

    // Build canonical URL for caching
    const canonicalURL = buildCanonicalListURL('/admin/organizations', params, LIST_CONFIG);
    
    // Log performance metrics
    const renderTime = Date.now() - startTime;
    logListPageMetrics('organizations', params, result, renderTime);

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Organizations', current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title="Organizations"
            description="Manage healthcare organizations and their settings"
            createButtonText="Add Organization"
            createHref="/admin/organizations/create"
            filterConfig={organizationFilterConfig}
            // Remove the onExport prop - export functionality will be handled by the client component
          />

          <DataTable
            columns={organizationColumns}
            data={tableData}
            pagination={{
              currentPage: result.data.page,
              pageSize: result.data.pageSize,
              totalPages: result.data.totalPages,
              hasNextPage: result.data.hasNextPage,
              hasPreviousPage: result.data.hasPreviousPage,
              // totalCount: result.data.totalCount,
            }}
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No organizations found. Create your first organization to get started."
            selectable={user?.role === 'super_admin'}
            bulkActions={
              user?.role === 'super_admin' ? (
                <div className="flex gap-2">
                  {/* Bulk action buttons would go here */}
                </div>
              ) : undefined
            }
          />
        </div>
      </ListPageWrapper>
    );

  } catch (error) {
    console.error('❌ [organizations] Page render error:', error);
    
    const renderTime = Date.now() - startTime;
    logListPageMetrics('organizations', { page: 1, pageSize: 10, searchQuery: '', sortBy: 'name', sortDirection: 'asc', filters: {} }, { success: false, error: error instanceof Error ? error.message : 'Unknown error' }, renderTime);
    
    return (
      <ListPageWrapper 
        error={error instanceof Error ? error.message : 'An unexpected error occurred'}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Organizations', current: true },
        ]}
      />
    );
  }
}