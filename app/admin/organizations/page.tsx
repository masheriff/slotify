// app/admin/organizations/page.tsx - FIXED pagination data access
import {
  parseListParams,
  fetchListData,
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
  ListParams,
  Organization,
  OrganizationListItem,
} from "@/types";
import { getErrorMessage } from "@/types/server-actions.types";

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
      "organizations",
      "read",
      user
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
          error={getErrorMessage(result.error ?? "Failed to load organizations")}
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Organizations", current: true },
          ]}
        />
      );
    }

    // FIXED: Access the correct data structure
    const organizationsArray = result.data.data;
    const paginationInfo = result.data.pagination;

    console.log("🔍 Debug pagination data:", {
      totalCount: paginationInfo.totalCount,
      totalPages: paginationInfo.totalPages,
      currentPage: paginationInfo.page,
      pageSize: paginationInfo.pageSize,
      arrayLength: organizationsArray.length,
    });

    handleListPageRedirect(
      "/admin/organizations",
      params,
      paginationInfo.totalPages
    );

    const tableData: OrganizationListItem[] = organizationsArray.map(
      (org: any, index: number) => {
        console.log(`🔄 Transforming org ${index + 1}:`, {
          id: org.id,
          name: org.name,
          fullMetadata: org.metadata,
          metadataType: org.metadata?.type,
          metadataIsActive: org.metadata?.isActive,
          metadataContactEmail: org.metadata?.contactEmail,
        });

        const transformed: OrganizationListItem = {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          type: org.metadata?.type === "admin" ? "admin" : "client",
          contactEmail: org.metadata?.contactEmail || "",
          contactPhone: org.metadata?.contactPhone || "",
          city: org.metadata?.city || "",
          state: org.metadata?.state || "",
          country: org.metadata?.country || "",
          isActive: org.metadata?.isActive,
          createdAt: org.createdAt,
          status: org.metadata?.status || "active",
        };

        console.log(`✅ Transformed result ${index + 1}:`, transformed);
        return transformed;
      }
    );

    console.log("📊 Final table data summary:", {
      totalCount: tableData.length,
      typeDistribution: tableData.reduce(
        (acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      sampleData: tableData.slice(0, 2),
    });

    const renderTime = Date.now() - startTime;
    logListPageMetrics(
      "organizations",
      params,
      {
        ...result,
        error: getErrorMessage(getErrorMessage(result.error ?? "An error occurred")),
      },
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
            data={tableData}
            pagination={{
              // FIXED: Use correct property names and data source
              currentPage: paginationInfo.page,
              pageSize: paginationInfo.pageSize,
              totalPages: paginationInfo.totalPages,
              hasNextPage: paginationInfo.hasNextPage,
              hasPreviousPage: paginationInfo.hasPreviousPage,
              totalCount: paginationInfo.totalCount, // This should fix the NaN issue
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