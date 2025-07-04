// app/[orgSlug]/staff/users/page.tsx
import {
  parseListParams,
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess,
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { UsersDataTable } from "@/components/tables/users-data-table"; // UPDATED IMPORT
import { getUsersList } from "@/actions/users.actions";
import { getCurrentUser } from "@/lib/auth-server";
import { getOrganizationBySlug } from "@/actions/organization.actions";
import { type UserListItem } from "@/types/users.types";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";
import { clientOrgUserFilterConfig } from "@/components/client/forms/clinet-org-user-filters-config";

interface ClientOrgUsersPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function ClientOrgUsersPage({ 
  params, 
  searchParams 
}: ClientOrgUsersPageProps) {
  const startTime = Date.now();
  const { orgSlug } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    // Parse list parameters
    const listParams = await parseListParams(resolvedSearchParams, LIST_CONFIG);
    const currentUser = await getCurrentUser();

    // Get organization details
    const orgResult = await getOrganizationBySlug(orgSlug);
    if (!orgResult.success || !orgResult.data) {
      return (
        <ListPageWrapper
          error="Organization not found"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    const organization = orgResult.data;

    // Validate access - only client admins can view users
    const accessCheck = await validateListPageAccess(currentUser ?? undefined);
    if (!accessCheck.success) {
      return (
        <ListPageWrapper
          error="Access denied"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    // Additional permission check for client admin role
    if (currentUser?.role !== HEALTHCARE_ROLES.CLIENT_ADMIN) {
      return (
        <ListPageWrapper
          error="Only client administrators can manage users"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    // Fetch users data for this organization only
    const result = await getUsersList({
      organizationId: organization.id,  // Filter by organization
      page: listParams.page,
      pageSize: listParams.pageSize,
      search: listParams.searchQuery || undefined,
      sortBy: listParams.sortBy || undefined,
      sortDirection: listParams.sortDirection || undefined,
      role: listParams.filters.role || undefined,
      status: listParams.filters.status as 'active' | 'banned' | undefined,
      createdAfter: listParams.filters.createdAfter || undefined,
    });

    if (!result.success) {
      return (
        <ListPageWrapper
          error={result.error || "Failed to load users"}
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", current: true },
          ]}
        />
      );
    }

    // Handle redirect with clean pagination access
    handleListPageRedirect(
      `/${orgSlug}/staff/users`,
      listParams,
      result.pagination.totalPages
    );

    // Log metrics
    const renderTime = Date.now() - startTime;
    logListPageMetrics<UserListItem>(
      "client-org-users",
      listParams,
      result,
      renderTime
    );

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Dashboard", href: `/${orgSlug}/dashboard` },
          { label: "Staff", href: `/${orgSlug}/staff` },
          { label: "Users", current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title="Staff Members"
            description={`Manage users and their permissions for ${organization.name}`}
            createButtonText="Add User"
            createHref={`/${orgSlug}/staff/users/create`}
            filterConfig={clientOrgUserFilterConfig}
          />

          <UsersDataTable
            data={result.data}
            pagination={result.pagination}
            sorting={{
              sortBy: listParams.sortBy,
              sortDirection: listParams.sortDirection,
            }}
            emptyMessage="No staff members found. Add your first team member to get started."
            selectable={false} // Client admins don't need bulk actions
            currentUser={{
              role: currentUser?.role || 'unknown',
              organizationSlug: orgSlug, // Pass org slug for correct URLs
            }}
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [client-org-users] Page render error:", error);

    return (
      <ListPageWrapper
        error={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }
        breadcrumbs={[
          { label: "Dashboard", href: `/${orgSlug}/dashboard` },
          { label: "Staff", href: `/${orgSlug}/staff` },
          { label: "Users", current: true },
        ]}
      />
    );
  }
}