// app/admin/organizations/[id]/page.tsx
import { getOrganizationById } from "@/actions/organization-actions";
import { OrganizationDetailsContent } from "@/components/admin/organization/organization-details-content";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { getErrorMessage, OrganizationDetailsPageProps } from "@/types";



export default async function OrganizationDetailsPage({
  params,
}: OrganizationDetailsPageProps) {
  const { id } = await params;

  // Fetch organization data server-side using Better Auth
  const result = await getOrganizationById(id);

  // Handle errors and missing organizations
  if (!result.success || !result.data) {
    return (
      <ListPageWrapper
        error={getErrorMessage(result.error ?? "The organization you're looking for doesn't exist.") }
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Organizations', href: '/admin/organizations' },
          { label: 'Organization Details', current: true },
        ]}
      />
    );
  }

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Organizations', href: '/admin/organizations' },
        { label: result.data.name, current: true },
      ]}
    >
      <OrganizationDetailsContent 
        organization={result.data} 
        organizationId={id}
      />
    </ListPageWrapper>
  );
}