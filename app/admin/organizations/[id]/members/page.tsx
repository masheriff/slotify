// app/admin/organizations/[id]/members/page.tsx
import { use } from "react";
import {
  parseListParams,
  handleListPageRedirect,
  logListPageMetrics,
  validateListPageAccess,
} from "@/lib/list-page-server";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { memberColumns } from "@/components/table-configs/member-columns";
import { memberFilterConfig } from "@/components/admin/forms/member-filters-config";
import { listOrganizationMembers } from "@/actions/member-actions";
import { getOrganizationById } from "@/actions/organization-actions";
import { getCurrentUser } from "@/lib/auth-server";
import { getErrorMessage } from "@/types/server-actions.types";
import { MemberListItem } from "@/types";

interface OrganizationMembersPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    role?: string;
    status?: string;
    joinedAfter?: string;
  }>;
}

const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: "createdAt",
  defaultSortDirection: "desc" as const,
  maxPageSize: 100,
  allowedSortColumns: ["user.name", "user.email", "role", "createdAt"],
  searchable: true,
  exportable: true,
};

export default async function OrganizationMembersPage({
  params,
  searchParams,
}: OrganizationMembersPageProps) {
  const startTime = Date.now();

  // Unwrap params promise OUTSIDE of try/catch
  const { id: organizationId } = use(params);

  try {
    const parsedParams = await parseListParams(searchParams, LIST_CONFIG);
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
            { label: "Organizations", href: "/admin/organizations" },
            { label: "Members", current: true },
          ]}
        />
      );
    }

    // Get organization details first
    const orgResult = await getOrganizationById(organizationId);
    if (!orgResult.success || !orgResult.data) {
      return (
        <ListPageWrapper
          error="Organization not found"
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: "Members", current: true },
          ]}
        />
      );
    }

    const organization = orgResult.data;

    // Call listOrganizationMembers action
    const result = await listOrganizationMembers({
      organizationId,
      page: parsedParams.page,
      pageSize: parsedParams.pageSize,
      search: parsedParams.searchQuery || undefined,
      sortBy: parsedParams.sortBy || undefined,
      sortDirection: parsedParams.sortDirection || undefined,
      role: parsedParams.filters.role || undefined,
      status: parsedParams.filters.status || undefined,
      joinedAfter: parsedParams.filters.joinedAfter || undefined,
    });

    if (!result.success || !result.data) {
      return (
        <ListPageWrapper
          error={getErrorMessage(result.error ?? "Failed to load members")}
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organization.name, href: `/admin/organizations/${organizationId}` },
            { label: "Members", current: true },
          ]}
        />
      );
    }

    // Access the correct data structure (matching organizations page pattern)
    const members = result.data.data;
    const paginationInfo = result.data.pagination;

    // Handle page redirects if page is beyond total pages
    handleListPageRedirect(
      `/admin/organizations/${organizationId}/members`,
      parsedParams,
      paginationInfo.totalPages
    );

    // Log metrics with correct structure
    const renderTime = Date.now() - startTime;
    // logListPageMetrics(
    //   "organization-members",
    //   parsedParams,
    //   result,
    //   renderTime
    // );

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organization.name, href: `/admin/organizations/${organizationId}` },
          { label: "Members", current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title="Organization Members"
            description={`Manage members for ${organization.name}`}
            createButtonText="Invite Member"
            createHref={`/admin/organizations/${organizationId}/invite`}
            filterConfig={memberFilterConfig}
          />

          <DataTable
            columns={memberColumns}
            data={members}
            pagination={{
              currentPage: paginationInfo.page,
              pageSize: paginationInfo.pageSize,
              totalPages: paginationInfo.totalPages,
              hasNextPage: paginationInfo.hasNextPage,
              hasPreviousPage: paginationInfo.hasPreviousPage,
              totalCount: paginationInfo.totalCount,
            }}
            sorting={{
              sortBy: parsedParams.sortBy,
              sortDirection: parsedParams.sortDirection,
            }}
            emptyMessage="No members found. Invite the first member to get started."
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ Error loading organization members page:", error);
    
    return (
      <ListPageWrapper
        error="Failed to load organization members"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Members", current: true },
        ]}
      />
    );
  }
}