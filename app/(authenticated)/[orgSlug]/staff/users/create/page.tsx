// app/[orgSlug]/staff/users/create/page.tsx
import { getCurrentUser } from "@/lib/auth-server";
import { getOrganizationBySlug } from "@/actions/organization.actions";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { ClientOrgUserForm } from "@/components/client/forms/client-org-user-form";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";

interface CreateUserPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function CreateUserPage({ params }: CreateUserPageProps) {
  const { orgSlug } = await params;

  try {
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
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "Create", current: true },
          ]}
        />
      );
    }

    const organization = orgResult.data;

    // Permission check - only client admins can create users
    if (!currentUser || currentUser.role !== HEALTHCARE_ROLES.CLIENT_ADMIN) {
      return (
        <ListPageWrapper
          error="Only client administrators can create users"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "Create", current: true },
          ]}
        />
      );
    }

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Dashboard", href: `/${orgSlug}/dashboard` },
          { label: "Staff", href: `/${orgSlug}/staff` },
          { label: "Users", href: `/${orgSlug}/staff/users` },
          { label: "Create", current: true },
        ]}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Staff Member</h1>
            <p className="text-muted-foreground">
              Add a new team member to {organization.name}
            </p>
          </div>

          <ClientOrgUserForm
            mode="create"
            organizationId={organization.id}
            organizationSlug={orgSlug}
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [create-user] Page render error:", error);

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
          { label: "Users", href: `/${orgSlug}/staff/users` },
          { label: "Create", current: true },
        ]}
      />
    );
  }
}