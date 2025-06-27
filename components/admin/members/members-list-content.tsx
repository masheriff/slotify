// components/admin/members/members-list-content.tsx
"use client";

import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { memberColumns } from "@/components/table-configs/member-columns";
import { memberFilterConfig } from "@/components/admin/forms/member-filters-config";
import { MemberListItem, OrganizationListItem } from "@/types";

interface PaginationData {
  data: MemberListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MembersListContentProps {
  members: PaginationData;
  organization: OrganizationListItem;
  organizationId: string;
}

export function MembersListContent({ 
  members, 
  organization, 
  organizationId 
}: MembersListContentProps) {
  // Add organizationId to columns for actions
  const columnsWithOrgId = memberColumns.map(column => {
    // If this is the actions column, we need to pass the organizationId
    if (column.id === 'actions') {
      return {
        ...column,
        // Wrap the original cell function to inject organizationId as a prop
        cell: (ctx: any) => {
          const member = ctx.row.original as MemberListItem;
          return (
            <div className="flex items-center gap-2">
              {/* Actions will be handled by the column definition */}
              {typeof column.cell === "function"
                ? column.cell({ ...ctx, organizationId })
                : null}
            </div>
          );
        }
      };
    }
    return column;
  });

  return (
    <div className="space-y-6">
      <FilterablePageHeader
        title={`Members - ${organization.name}`}
        description={`Manage members and their roles for ${organization.name}`}
        createButtonText="Invite Member"
        createHref={`/admin/organizations/${organizationId}/members/invite`}
        filterConfig={memberFilterConfig}
      />

      <DataTable
        columns={columnsWithOrgId}
        data={members.data}
        pagination={{
          currentPage: members.page,
          pageSize: members.pageSize,
          totalPages: members.totalPages,
          hasNextPage: members.hasNextPage,
          hasPreviousPage: members.hasPreviousPage,
          totalCount: members.totalCount,
        }}
        sorting={{
          sortBy: undefined, // Will be read from URL params
          sortDirection: 'desc',
        }}
        emptyMessage="No members found. Invite your first member to get started."
      />
    </div>
  );
}