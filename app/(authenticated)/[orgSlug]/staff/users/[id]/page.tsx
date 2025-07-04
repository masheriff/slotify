// app/[orgSlug]/staff/users/[userId]/page.tsx
import { getCurrentUser } from "@/lib/auth-server";
import { getOrganizationBySlug } from "@/actions/organization.actions";
import { getUserById } from "@/actions/users.actions";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { ClientOrgUserDetails } from "@/components/client/details/client-org-user-details";
import { canViewUser } from "@/utils/users.utils";
import { UserRole } from "@/types/users.types";

interface ViewUserPageProps {
  params: Promise<{ orgSlug: string; userId: string }>;
}

export default async function ViewUserPage({ params }: ViewUserPageProps) {
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
            { label: "View", current: true },
          ]}
        />
      );
    }

    const organization = orgResult.data;

    // Get user details
    const userResult = await getUserById(userId);
    if (!userResult.success || !userResult.data) {
      return (
        <ListPageWrapper
          error="User not found"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "View", current: true },
          ]}
        />
      );
    }

    const targetUser = userResult.data;

    // Permission check - check if current user can view this user
    if (!currentUser) {
      return (
        <ListPageWrapper
          error="Authentication required"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "View", current: true },
          ]}
        />
      );
    }

    const canView = canViewUser(
      currentUser.role as UserRole, 
      targetUser.role as UserRole
    );

    if (!canView) {
      return (
        <ListPageWrapper
          error="You don't have permission to view this user"
          breadcrumbs={[
            { label: "Dashboard", href: `/${orgSlug}/dashboard` },
            { label: "Staff", href: `/${orgSlug}/staff` },
            { label: "Users", href: `/${orgSlug}/staff/users` },
            { label: "View", current: true },
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
          { label: targetUser.name || targetUser.email, current: true },
        ]}
      >
        <ClientOrgUserDetails
          user={targetUser}
          currentUser={{
            id: currentUser.id,
            role: currentUser.role ?? "",
            email: currentUser.email,
            name: currentUser.name,
          }}
          organization={organization}
          organizationSlug={orgSlug}
        />
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [view-user] Page render error:", error);

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
          { label: "View", current: true },
        ]}
      />
    );
  }
}