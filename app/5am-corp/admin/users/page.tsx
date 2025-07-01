// app/5am-corp/admin/users/page.tsx
import {
  parseListParams,
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess,
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { userColumns } from "@/components/table-configs/user-columns";
import { userFilterConfig } from "@/components/admin/forms/user-filters-config";
import { getUsersList } from "@/actions/user-actions";
import { getCurrentUser } from "@/lib/auth-server";
import { GenericListPageProps } from "@/types/page.types";
import { UserListItem } from "@/types/user.types";

const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: "name",
  defaultSortDirection: "asc" as const,
  maxPageSize: 100,
  allowedSortColumns: ["name", "createdAt", "email", "role"],
  searchable: true,
  exportable: true,
};

export default async function UsersPage({
  searchParams,
}: GenericListPageProps) {
  const startTime = Date.now();

  try {
    // ✅ Now compatible with parseListParams expecting Record<string, string | undefined>
    const params = await parseListParams(searchParams, LIST_CONFIG);
    const user = await getCurrentUser();
    const accessCheck = await validateListPageAccess(user ?? undefined);

    if (!accessCheck.success) {
      return (
        <ListPageWrapper
          error={accessCheck.error || "Access denied"}
          breadcrumbs={[
            { label: "Admin", href: "/5am-corp/admin" },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    // Rest of component implementation...
    const result = await getUsersList({
      page: params.page,
      pageSize: params.pageSize,
      search: params.searchQuery || undefined,
      sortBy: params.sortBy || undefined,
      sortDirection: params.sortDirection || undefined,
      role: params.filters.role || undefined,
      status: params.filters.status || undefined,
      organization: params.filters.organization || undefined,
      organizationType: params.filters.organizationType || undefined,
      createdAfter: params.filters.createdAfter || undefined,
      createdBefore: params.filters.createdBefore || undefined,
      lastLoginAfter: params.filters.lastLoginAfter || undefined,
      lastLoginBefore: params.filters.lastLoginBefore || undefined,
    });

    if (!result.success) {
      return (
        <ListPageWrapper
          error={result.error || "Failed to load users"}
          breadcrumbs={[
            { label: "Admin", href: "/5am-corp/admin" },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    // ✅ HANDLE REDIRECT WITH CLEAN PAGINATION ACCESS
    handleListPageRedirect(
      "/5am-corp/admin/users",
      params,
      result.pagination.totalPages
    );

    // ✅ LOG METRICS
    const renderTime = Date.now() - startTime;
    logListPageMetrics<UserListItem>(
      "users",
      params,
      result,
      renderTime
    );

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title="Users"
            description="Manage system users and their access"
            createButtonText="Add User"
            createHref="/5am-corp/admin/users/create"
            filterConfig={userFilterConfig}
          />

          {/* ✅ CLEAN DATA FLOW - NO TRANSFORMATION NEEDED */}
          <DataTable
            columns={userColumns}     
            data={result.data}               
            pagination={result.pagination}   
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No users found. Create your first user to get started."
            // Note: No bulk operations or selectable for simplified users page
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [users] Page render error:", error);

    return (
      <ListPageWrapper
        error={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", current: true },
        ]}
      />
    );
  }
}