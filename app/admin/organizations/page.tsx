// app/admin/organizations/page.tsx - FIXED data access
import { Metadata } from "next";
import { 
  parseListParams, 
  fetchListData, 
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess 
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/components/table-configs/organization-columns";
import { organizationFilterConfig } from "@/components/admin/forms/organization-filters-config";
import { listOrganizations } from "@/actions/organization-actions";
import { getCurrentUser } from "@/lib/auth-server";
import { ListDataResult, Organization, OrganizationListItem } from "@/types";

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
    const params = await parseListParams(searchParams, LIST_CONFIG);
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

    const result = await fetchListData<Organization>(
      listOrganizations,
      params,
      { module: 'organizations', user }
    );

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

    // FIXED: Now we access data directly since fetchListData no longer double-wraps
    const paginationData = result.data;
    const organizationsArray = paginationData.data;

    console.log('🔍 Debug pagination data:', {
      totalCount: paginationData.totalCount,
      totalPages: paginationData.totalPages,
      currentPage: paginationData.page,
      pageSize: paginationData.pageSize,
      arrayLength: organizationsArray.length
    });

    handleListPageRedirect('/admin/organizations', params, paginationData.totalPages);

    const tableData: OrganizationListItem[] = organizationsArray.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug || '',
    type: (org.metadata?.type as "admin" | "client") || 'client',
      contactEmail: org.metadata?.contactEmail || '',
      contactPhone: org.metadata?.contactPhone || '',
      country: org.metadata?.country || '',
      city: org.metadata?.city || '',
      state: org.metadata?.state || '',
      isActive: org.metadata?.isActive ?? true,
      createdAt: org.createdAt,
      logo: org.logo,
      status: org.metadata?.status || 'active',
    }));

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
          />

          <DataTable
            columns={organizationColumns}
            data={tableData}
            pagination={{
              currentPage: paginationData.page,
              pageSize: paginationData.pageSize,
              totalPages: paginationData.totalPages,
              hasNextPage: paginationData.hasNextPage,
              hasPreviousPage: paginationData.hasPreviousPage,
              totalCount: paginationData.totalCount,
            }}
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No organizations found. Create your first organization to get started."
            selectable={user?.role === 'system_admin'}
            bulkActions={
              user?.role === 'system_admin' ? (
                <div className="flex gap-2">
                  {/* Bulk action buttons */}
                </div>
              ) : undefined
            }
          />
        </div>
      </ListPageWrapper>
    );

  } catch (error) {
    console.error('❌ [organizations] Page render error:', error);
    
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