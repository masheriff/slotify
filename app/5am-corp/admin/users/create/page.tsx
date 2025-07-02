// app/5am-corp/admin/users/create/page.tsx
import { Metadata } from "next";
import { ListPageWrapper } from "@/components/common/list-page-wrapper";
import { UserForm } from "@/components/admin/forms/user-form";
import { validateListPageAccess } from "@/lib/list-page-server";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Create User",
  description: "Create a new user in the system",
};

export default async function CreateUserPage() {
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
            { label: "Create", current: true },
          ]}
        />
      );
    }

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/5am-corp/admin" },
          { label: "Users", href: "/5am-corp/admin/users" },
          { label: "Create", current: true },
        ]}
      >
        <div className="max-w-4xl mx-auto">
          <UserForm 
            mode="create" 
            onSuccess={() => {
              // Redirect will be handled by the form component
            }}
          />
        </div>
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ [users/create] Page render error:", error);

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
          { label: "Create", current: true },
        ]}
      />
    );
  }
}