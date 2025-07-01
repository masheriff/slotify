// app/admin/organizations/[id]/members/[memberId]/page.tsx
import { getMemberById } from "@/actions/member-actions";
import { getOrganizationById } from "@/actions/organization-actions";
import { MemberDetailsContent } from "@/components/admin/members/members-details-content";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { getErrorMessage, MemberDetailsPageProps } from "@/types";



export default async function MemberDetailsPage({
  params,
}: MemberDetailsPageProps) {
  const { id: organizationId, memberId } = await params;

  try {
    // Fetch both member and organization data
    const [memberResult, organizationResult] = await Promise.all([
      getMemberById(memberId),
      getOrganizationById(organizationId),
    ]);

    // Handle organization not found
    if (!organizationResult.success || !organizationResult.data) {
      return (
        <ListPageWrapper
          error={getErrorMessage(organizationResult.error || "Organization not found")}
          breadcrumbs={[
            { label: 'Admin', href: '/5am-corp/admin' },
            { label: 'Organizations', href: '/5am-corp/admin/organizations' },
            { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
            { label: 'Member Details', current: true },
          ]}
        />
      );
    }

    // Handle member not found
    if (!memberResult.success || !memberResult.data) {
      return (
        <ListPageWrapper
          error={getErrorMessage(memberResult.error || "Member not found")}
          breadcrumbs={[
            { label: 'Admin', href: '/5am-corp/admin' },
            { label: 'Organizations', href: '/5am-corp/admin/organizations' },
            { label: organizationResult.data.name, href: `/5am-corp/admin/organizations/${organizationId}` },
            { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
            { label: 'Member Details', current: true },
          ]}
        />
      );
    }

    // Verify member belongs to organization
    if (memberResult.data.organizationId !== organizationId) {
      return (
        <ListPageWrapper
          error="Member does not belong to this organization"
          breadcrumbs={[
            { label: 'Admin', href: '/5am-corp/admin' },
            { label: 'Organizations', href: '/5am-corp/admin/organizations' },
            { label: organizationResult.data.name, href: `/5am-corp/admin/organizations/${organizationId}` },
            { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
            { label: 'Member Details', current: true },
          ]}
        />
      );
    }

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Organizations', href: '/5am-corp/admin/organizations' },
          { label: organizationResult.data.name, href: `/5am-corp/admin/organizations/${organizationId}` },
          { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
          { label: memberResult.data.user.name || memberResult.data.user.email, current: true },
        ]}
      >
        <MemberDetailsContent 
          member={memberResult.data}
          organization={organizationResult.data}
          organizationId={organizationId}
          memberId={memberId}
        />
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ Error loading member details:", error);
    
    return (
      <ListPageWrapper
        error={error instanceof Error ? error.message : "Failed to load member details"}
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Organizations', href: '/5am-corp/admin/organizations' },
          { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
          { label: 'Member Details', current: true },
        ]}
      />
    );
  }
}