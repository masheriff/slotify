// app/admin/organizations/[id]/page.tsx

import { useOrganizationDetails } from "@/hooks/use-organization-details";
import { useOrganizationNotFoundNavigation } from "@/hooks/use-not-found-navigation";
import { OrganizationNotFound } from "@/components/common/not-found";
import { OrganizationDetailsContent } from "@/components/admin/organization/organization-details-content";

interface OrganizationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailsPage({
  params,
}: OrganizationDetailsPageProps) {
  const { id } = await params;


  const { organization, error, refreshOrganization } = useOrganizationDetails(id);
  const { goBack, goHome, refresh } = useOrganizationNotFoundNavigation(refreshOrganization);


  // Show not found component for errors or missing organization
  if (error || (!organization && id)) {
    return (
      <OrganizationNotFound
        title={error ? "Error Loading Organization" : undefined}
        description={error || undefined}
        onBack={goBack}
        onRefresh={refresh}
        onGoHome={goHome}
      />
    );
  }

  // Don't render content until we have organization data
  if (!organization) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4">
      <OrganizationDetailsContent 
        organization={organization} 
        organizationId={id}
      />
    </div>
  );
}