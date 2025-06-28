// app/admin/organizations/[id]/members/page.tsx
import { getMembersList } from "@/actions/member-actions";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { getOrganizationById } from "@/actions/organization-actions";
import { getErrorMessage } from "@/types";
import { FilterablePageHeader } from "@/components/common/filterable-page-header";
import { DataTable } from "@/components/common/data-table";
import { memberColumns } from "@/components/table-configs/member-columns";
import { memberFilterConfig } from "@/components/admin/forms/member-filters-config";

interface MembersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MembersPage({ params, searchParams }: MembersPageProps) {
  const { id: organizationId } = await params;
  const searchParamsResolved = await searchParams;

  // Parse search params
  const page = parseInt(searchParamsResolved.page as string) || 1;
  const pageSize = parseInt(searchParamsResolved.pageSize as string) || 10;
  const search = searchParamsResolved.search as string;
  const sortBy = searchParamsResolved.sortBy as string;
  const sortDirection = (searchParamsResolved.sortDirection as 'asc' | 'desc') || 'desc';
  const role = searchParamsResolved.role as string;
  const status = searchParamsResolved.status as string;
  const joinedAfter = searchParamsResolved.joinedAfter as string;

  // Get organization details for breadcrumb
  const orgResult = await getOrganizationById(organizationId);
  if (!orgResult.success || !orgResult.data) {
    return (
      <ListPageWrapper
        error={getErrorMessage(orgResult.error ?? "Organization not found")}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Organizations', href: '/admin/organizations' },
          { label: 'Members', current: true },
        ]}
      />
    );
  }

  // Fetch members data
  const membersResult = await getMembersList({
    organizationId,
    page,
    pageSize,
    search,
    sortBy,
    sortDirection,
    role,
    status,
    joinedAfter,
  });

  console.log(membersResult)

  if (!membersResult.success) {
    return (
      <ListPageWrapper
        error={getErrorMessage(membersResult.error ?? "Failed to load members")}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Organizations', href: '/admin/organizations' },
          { label: orgResult.data.name, href: `/admin/organizations/${organizationId}` },
          { label: 'Members', current: true },
        ]}
      />
    );
  }

  // The memberColumns already handles organizationId through table meta
  // We just need to pass the organizationId in the DataTable meta prop

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Organizations', href: '/admin/organizations' },
        { label: orgResult.data.name, href: `/admin/organizations/${organizationId}` },
        { label: 'Members', current: true },
      ]}
    >
      <div className="space-y-6">
        <FilterablePageHeader
          title={`Members - ${orgResult.data.name}`}
          description={`Manage members and their roles for ${orgResult.data.name}`}
          createButtonText="Invite Member"
          createHref={`/admin/organizations/${organizationId}/members/invite`}
          filterConfig={memberFilterConfig}
        />

        <DataTable
          columns={memberColumns}
          data={membersResult.data?.data ?? []}
          pagination={{
            currentPage: membersResult.data?.page ?? 1,
            pageSize: membersResult.data?.pageSize ?? 10,
            totalPages: membersResult.data?.totalPages ?? 1,
            hasNextPage: membersResult.data?.hasNextPage ?? false,
            hasPreviousPage: membersResult.data?.hasPreviousPage ?? false,
            totalCount: membersResult.data?.totalCount ?? 0,
          }}
          sorting={{
            sortBy: undefined, // Will be read from URL params
            sortDirection: 'desc',
          }}
          emptyMessage="No members found. Invite your first member to get started."
        />
      </div>
    </ListPageWrapper>
  );
}