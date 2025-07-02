// app/5am-corp/admin/users/page.tsx
import {
  parseListParams,
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess,
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { userColumns } from "@/components/table-configs/user-columns";
import { userFilterConfig } from "@/components/admin/forms/user-filters-config";
import { getUsersList } from "@/actions/users.actions";
import { getCurrentUser } from "@/lib/auth-server";
import { type UserListItem } from "@/types/users.types";

interface UsersPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: "createdAt",
  defaultSortDirection: "desc" as const,
  maxPageSize: 100,
  allowedSortColumns: ["name", "email", "role", "createdAt"],
  searchable: true,
  exportable: false,
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const startTime = Date.now();

  try {
    // Parse list parameters using the organization pattern
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

    // Fetch users data using the consistent action pattern
    const result = await getUsersList({
      page: params.page,
      pageSize: params.pageSize,
      search: params.searchQuery || undefined,
      sortBy: params.sortBy || undefined,
      sortDirection: params.sortDirection || undefined,
      role: params.filters.role || undefined,
      organizationId: params.filters.organization || undefined,
      status: params.filters.status as 'active' | 'banned' | undefined,
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

    // Handle redirect with clean pagination access
    handleListPageRedirect(
      "/5am-corp/admin/users",
      params,
      result.pagination.totalPages
    );

    // Log metrics
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
            description="Manage system users and their permissions"
            createButtonText="Create User"
            createHref="/5am-corp/admin/users/create"
            filterConfig={userFilterConfig}
          />

          {/* Clean data flow - no transformation needed */}
          <DataTable
            columns={userColumns}
            data={result.data}
            pagination={result.pagination}
            sorting={{
              sortBy: params.sortBy,
              sortDirection: params.sortDirection,
            }}
            emptyMessage="No users found. Create your first user to get started."
            selectable={user?.role === "system_admin"}
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