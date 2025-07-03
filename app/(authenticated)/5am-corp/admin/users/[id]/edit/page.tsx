// app/5am-corp/admin/users/[id]/edit/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { UserForm } from "@/components/admin/forms/user-form";
import { validateListPageAccess } from "@/lib/list-page-server";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserById } from "@/actions/users.actions";

interface EditUserPageProps {
  params: {
    // FIXED: Changed from userId to id to match folder structure [id]
    id: string;
  };
}

export async function generateMetadata({ params }: EditUserPageProps): Promise<Metadata> {
  try {
    // FIXED: Use params.id instead of params.userId
    const result = await getUserById(params.id);
    
    if (result.success && result.data) {
      return {
        title: `Edit ${result.data.name}`,
        description: `Edit user details for ${result.data.name}`,
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Edit User",
    description: "Edit user details",
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
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
            { label: "Edit", current: true },
          ]}
        />
      );
    }

    // Get user data - FIXED: Use params.id instead of params.userId
    const result = await getUserById(params.id);
    
    if (!result.success || !result.data) {
      // FIXED: Log the correct parameter name
      console.error("User not found:", params.id);
      notFound();
    }

    const userData = result.data;

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", href: "/5am-corp/admin/users" },
          // FIXED: Use params.id in the breadcrumb link
          { label: userData.name ?? "Unknown User", href: `/5am-corp/admin/users/${params.id}` },
          { label: "Edit", current: true },
        ]}
      >
        <div className="max-w-4xl mx-auto">
          {/* FIXED: Removed onSuccess prop and use params.id */}
          <UserForm 
            mode="edit" 
            userId={params.id}
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [users/[id]/edit] Page render error:", error);

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
          { label: "Edit", current: true },
        ]}
      />
    );
  }
}