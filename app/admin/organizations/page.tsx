// app/admin/organizations/page.tsx - FIXED pagination data access
import {
  parseListParams,
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess,
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/components/table-configs/organization-columns";
import { organizationFilterConfig } from "@/components/admin/forms/organization-filters-config";
import { listOrganizations } from "@/actions/organization-actions";
import { getCurrentUser } from "@/lib/auth-server";
import {
  Organization,
} from "@/types";

interface OrganizationsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    type?: string;
    createdAfter?: string;
    status?: string;
    contactEmail?: string;
  }>;
}

const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: "name",
  defaultSortDirection: "asc" as const,
  maxPageSize: 100,
  allowedSortColumns: ["name", "createdAt", "type", "city", "state"],
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
    const accessCheck = await validateListPageAccess(
      user ?? undefined
    );

    if (!accessCheck.success) {
      return (
        <ListPageWrapper
          error={accessCheck.error || "Access denied"}
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Organizations", current: true },
          ]}
        />
      );
    }

    // Call listOrganizations directly since it returns the correct structure
    const result = await listOrganizations({
      page: params.page,
      pageSize: params.pageSize,
      search: params.searchQuery || undefined,
      sortBy: params.sortBy || undefined,
      sortDirection: params.sortDirection || undefined,
      type: params.filters.type || undefined,
      status: params.filters.status || undefined,
      contactEmail: params.filters.contactEmail || undefined,
      createdAfter: params.filters.createdAfter || undefined,
    });

    if (!result.success || !result.data) {
      return (
        <ListPageWrapper
          error={result.error ?? "Failed to load organizations"}
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Organizations", current: true },
          ]}
        />
      );
    }

    // FIXED: Access the correct data structure
    const organizationsArray = result.data;
    const paginationInfo = result.pagination;

    console.log("🔍 Debug pagination data:", {
      totalCount: paginationInfo?.totalCount,
      totalPages: paginationInfo?.totalPages,
      currentPage: paginationInfo?.page,
      pageSize: paginationInfo?.pageSize,
      arrayLength: organizationsArray.length,
    });

    handleListPageRedirect(
      "/admin/organizations",
      params,
      paginationInfo?.totalPages ?? 0
    );


    const renderTime = Date.now() - startTime;
    logListPageMetrics<Organization>(
      "organizations",
      params,
      result,
      renderTime
    );

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", current: true },
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
            data={organizationsArray}
            pagination={{
              // FIXED: Use correct property names and data source
              currentPage: paginationInfo.page,
              pageSize: paginationInfo.pageSize,
              totalPages: paginationInfo.totalPages,
              hasNextPage: paginationInfo.hasNextPage,
              hasPreviousPage: paginationInfo.hasPreviousPage,
              totalCount: paginationInfo?.totalCount ?? 0, // This should fix the NaN issue
            }}
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No organizations found. Create your first organization to get started."
            selectable={user?.role === "system_admin"}
            bulkActions={
              user?.role === "system_admin" ? (
                <div className="flex gap-2">{/* Bulk action buttons */}</div>
              ) : undefined
            }
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [organizations] Page render error:", error);

    return (
      <ListPageWrapper
        error={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", current: true },
        ]}
      />
    );
  }
}