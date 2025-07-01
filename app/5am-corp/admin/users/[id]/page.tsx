// app/5am-corp/admin/users/[id]/page.tsx - Individual User Details Page
import { getUserById } from "@/actions/user-actions";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { UserDetailsContent } from "@/components/admin/users/user-details-content";
import { notFound } from "next/navigation";
import { use } from "react";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id: userId } = use(params);

  return (
    <UserDetailsPageContent userId={userId} />
  );
}

async function UserDetailsPageContent({ userId }: { userId: string }) {
  try {
    // Fetch user data
    const result = await getUserById({ userId });

    if (!result.success || !result.data) {
      notFound();
    }

    const user = result.data;

    return (
      <ListPageWrapper
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Users', href: '/5am-corp/admin/users' },
          { label: user.name || user.email, current: true },
        ]}
      >
        <UserDetailsContent 
          user={user}
          userId={userId}
          canEdit={true} // TODO: Implement proper permission checking
          canBan={true} // TODO: Implement proper permission checking
          canDelete={false} // Users typically shouldn't be deleted
        />
      </ListPageWrapper>
    );
  } catch (error) {
    console.error("❌ Error loading user details:", error);
    
    return (
      <ListPageWrapper
        error={error instanceof Error ? error.message : "Failed to load user details"}
        breadcrumbs={[
          { label: 'Admin', href: '/5am-corp/admin' },
          { label: 'Users', href: '/5am-corp/admin/users' },
          { label: 'User Details', current: true },
        ]}
      />
    );
  }
}