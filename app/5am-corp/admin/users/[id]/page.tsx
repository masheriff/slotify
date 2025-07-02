// app/5am-corp/admin/users/[userId]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { UserDetailsContent } from "@/components/admin/user/user-details-content";
import { validateListPageAccess } from "@/lib/list-page-server";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserById } from "@/actions/users.actions";

interface UserDetailsPageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata({ params }: UserDetailsPageProps): Promise<Metadata> {
  try {
    const result = await getUserById(params.userId);
    
    if (result.success && result.data) {
      return {
        title: `${result.data.name} - User Details`,
        description: `User details for ${result.data.name}`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "User Details",
    description: "View user details and information",
  };
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  try {
    // Get current user and validate access
    const user = await getCurrentUser();
    const accessCheck = await validateListPageAccess(user ?? undefined);

    if (!accessCheck.success) {
      return (
        <ListPageWrapper
          error={accessCheck.error || "Access denied"}
          breadcrumbs={[
            { label: "Admin", href: "/5am-corp/admin" },
            { label: "Users", href: "/5am-corp/admin/users" },
            { label: "Details", current: true },
          ]}
        />
      );
    }

    // Get user data
    const result = await getUserById(params.userId);
    
    if (!result.success || !result.data) {
      console.error("User not found:", params.userId);
      notFound();
    }

    const userData = result.data;

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", href: "/5am-corp/admin/users" },
          { label: userData.name ?? "Unknown User", current: true },
        ]}
      >
        <UserDetailsContent 
          user={userData}
          userId={params.userId}
        />
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [users/[userId]] Page render error:", error);

    return (
      <ListPageWrapper
        error={
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        }
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", href: "/5am-corp/admin/users" },
          { label: "Details", current: true },
        ]}
      />
    );
  }
}