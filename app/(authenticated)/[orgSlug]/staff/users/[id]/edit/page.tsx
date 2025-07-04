// app/[orgSlug]/staff/users/[userId]/edit/page.tsx
import { getCurrentUser } from "@/lib/auth-server";
import { getOrganizationBySlug } from "@/actions/organization.actions";
import { getUserById } from "@/actions/users.actions";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { ClientOrgUserForm } from "@/components/client/forms/client-org-user-form";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";
import { canEditUser } from "@/utils/users.utils";
import { UserRole } from "@/types/users.types";

interface EditUserPageProps {
  params: Promise<{ orgSlug: string; userId: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { orgSlug, userId } = await params;

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
            { label: "Edit", current: true },
          ]}
        />
      );
    }

    const organization = orgResult.data;

    // Permission check - only client admins can edit users
    if (!currentUser || currentUser.role !== HEALTHCARE_ROLES.CLIENT_ADMIN) {
      return (
        <ListPageWrapper
          error="Only client administrators can edit users"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "Edit", current: true },
          ]}
        />
      );
    }

    // Get user details for permission check and display
    const userResult = await getUserById(userId);
    if (!userResult.success || !userResult.data) {
      return (
        <ListPageWrapper
          error="User not found"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "Edit", current: true },
          ]}
        />
      );
    }

    const targetUser = userResult.data;

    // Check if current user can edit this specific user
    const canEdit = canEditUser(
      currentUser.role as UserRole, 
      targetUser.role as UserRole
    );

    if (!canEdit) {
      return (
        <ListPageWrapper
          error="You don't have permission to edit this user"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "Edit", current: true },
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
          { label: targetUser.name || targetUser.email, href: `/${orgSlug}/staff/users/${userId}` },
          { label: "Edit", current: true },
        ]}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Staff Member</h1>
            <p className="text-muted-foreground">
              Update {targetUser.name || targetUser.email}'s information and permissions
            </p>
          </div>

          <ClientOrgUserForm
            mode="edit"
            userId={userId}
            organizationId={organization.id}
            organizationSlug={orgSlug}
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [edit-user] Page render error:", error);

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
          { label: "Edit", current: true },
        ]}
      />
    );
  }
}