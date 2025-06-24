// app/admin/organizations/[id]/page.tsx
import { getOrganizationById } from "@/actions/organization-actions";
import { OrganizationNotFound } from "@/components/common/not-found";
import { OrganizationDetailsContent } from "@/components/admin/organization/organization-details-content";
import { redirect } from "next/navigation";

interface OrganizationDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailsPage({
  params,
}: OrganizationDetailsPageProps) {
  const { id } = await params;

  // Fetch organization data server-side using Better Auth
  const result = await getOrganizationById(id);

  // Handle errors and missing organizations
  if (!result.success || !result.data) {
    return (
      <OrganizationNotFound
        title="Organization Not Found"
        description={result.error || "The organization you're looking for doesn't exist."}
        onBack={() => redirect("/admin/organizations")}
        onGoHome={() => redirect("/admin")}
        onRefresh={() => redirect(`/admin/organizations/${id}`)}
      />
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4">
      <OrganizationDetailsContent 
        organization={result.data} 
        organizationId={id}
      />
    </div>
  );
}