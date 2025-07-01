// app/5am-corp/admin/users/[id]/edit/page.tsx - Edit User Page
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { UserForm } from "@/components/admin/forms/user-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { id: userId } = use(params);

  const handleSuccess = () => {
    router.push(`/5am-corp/admin/users/${userId}`);
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/5am-corp/admin' },
        { label: 'Users', href: '/5am-corp/admin/users' },
        { label: 'User Details', href: `/5am-corp/admin/users/${userId}` },
        { label: 'Edit', current: true },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">
              Update user information and professional details
            </p>
          </div>
        </div>

        <UserForm 
          mode="edit"
          userId={userId}
          onSuccess={handleSuccess}
        />
      </div>
    </ListPageWrapper>
  );
}
