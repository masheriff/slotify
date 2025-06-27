// app/admin/organizations/[id]/members/page.tsx
import { getMembersList } from "@/actions/member-actions";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { getOrganizationById } from "@/actions/organization-actions";
import { getErrorMessage } from "@/types";
import { MembersListContent } from "@/components/admin/members/members-list-content";

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

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Organizations', href: '/admin/organizations' },
        { label: orgResult.data.name, href: `/admin/organizations/${organizationId}` },
        { label: 'Members', current: true },
      ]}
    >
      <MembersListContent 
        members={membersResult.data}
        organization={orgResult.data}
        organizationId={organizationId}
      />
    </ListPageWrapper>
  );
}