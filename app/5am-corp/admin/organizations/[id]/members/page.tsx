// app/admin/organizations/[id]/members/page.tsx - UPDATED
import { getMembersList } from "@/actions/member-actions";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { getOrganizationById } from "@/actions/organization-actions";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { memberColumns } from "@/components/table-configs/member-columns";
import { memberFilterConfig } from "@/components/admin/forms/member-filters-config";
import { 
  parseListParams, 
  handleListPageRedirect, 
  logListPageMetrics 
} from "@/lib/list-page-server";
import { MemberListItem } from "@/types/member.types";
import { getErrorMessage } from "@/types";
import { MembersPageProps } from "@/types/page.types";

const LIST_CONFIG = {
  defaultPageSize: 10,
  defaultSort: "createdAt",
  defaultSortDirection: "desc" as const,
  maxPageSize: 100,
  allowedSortColumns: ["createdAt", "role", "user.name", "user.email"],
  searchable: true,
};

export default async function MembersPage({ 
  params, 
  searchParams 
}: MembersPageProps) {
  const startTime = Date.now();
  const { id: organizationId } = await params;

  try {
    // ✅ Now compatible with parseListParams expecting Record<string, string | undefined>
    const listParams = await parseListParams(searchParams, LIST_CONFIG);

    // Get organization details for breadcrumb
    const orgResult = await getOrganizationById(organizationId);
    if (!orgResult.success || !orgResult.data) {
      return (
        <ListPageWrapper
          error={getErrorMessage(orgResult.error || "Organization not found")}
          breadcrumbs={[
            { label: 'Admin', href: '/5am-corp/admin' },
            { label: 'Organizations', href: '/5am-corp/admin/organizations' },
            { label: 'Members', current: true },
          ]}
        />
      );
    }

    // Call action with proper parameter mapping
    const membersResult = await getMembersList({
      organizationId,
      page: listParams.page,
      pageSize: listParams.pageSize,
      search: listParams.searchQuery || undefined,
      sortBy: listParams.sortBy || undefined,
      sortDirection: listParams.sortDirection || undefined,
      role: listParams.filters.role || undefined,
      status: listParams.filters.status || undefined,
      joinedAfter: listParams.filters.joinedAfter || undefined,
    });

    if (!membersResult.success) {
      return (
        <ListPageWrapper
          error={membersResult.error || "Failed to load members"}
          breadcrumbs={[
            { label: 'Admin', href: '/5am-corp/admin' },
            { label: 'Organizations', href: '/5am-corp/admin/organizations' },
            { label: orgResult.data.name, href: `/5am-corp/admin/organizations/${organizationId}` },
            { label: 'Members', current: true },
          ]}
        />
      );
    }

    // ✅ HANDLE REDIRECT WITH CLEAN PAGINATION ACCESS
    handleListPageRedirect(
      `/admin/organizations/${organizationId}/members`,
      listParams,
      membersResult.pagination.totalPages
    );

    // ✅ LOG METRICS
    const renderTime = Date.now() - startTime;
    logListPageMetrics<MemberListItem>(
      "members",
      listParams,
      membersResult,
      renderTime
    );

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Organizations', href: '/5am-corp/admin/organizations' },
          { label: orgResult.data.name, href: `/5am-corp/admin/organizations/${organizationId}` },
          { label: 'Members', current: true },
        ]}
      >
        <div className="space-y-6">
          <FilterablePageHeader
            title={`Members - ${orgResult.data.name}`}
            description={`Manage members and their roles for ${orgResult.data.name}`}
            createButtonText="Invite Member"
            createHref={`/5am-corp/admin/organizations/${organizationId}/members/invite`}
            filterConfig={memberFilterConfig}
          />

          {/* ✅ CLEAN DATA FLOW - NO TRANSFORMATION NEEDED */}
          <DataTable
            columns={memberColumns}           // ✅ Typed for MemberListItem
            data={membersResult.data}         // ✅ MemberListItem[] - direct pass
            pagination={membersResult.pagination} // ✅ PaginationData - direct pass
            sorting={{
              sortBy: listParams.sortBy,
              sortDirection: listParams.sortDirection,
            }}
            emptyMessage="No members found. Invite your first member to get started."
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [members] Page render error:", error);

    return (
      <ListPageWrapper
        error={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Organizations', href: '/5am-corp/admin/organizations' },
          { label: 'Members', current: true },
        ]}
      />
    );
  }
}