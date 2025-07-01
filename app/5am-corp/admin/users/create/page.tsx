// app/5am-corp/admin/users/create/page.tsx - Create User Page
"use client";

import { useRouter } from "next/navigation";
import { UserForm } from "@/components/admin/forms/user-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";

export default function CreateUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/5am-corp/admin/users");
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/5am-corp/admin' },
        { label: 'Users', href: '/5am-corp/admin/users' },
        { label: 'Create', current: true },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
            <p className="text-muted-foreground">
              Add a new user to the system with optional professional details
            </p>
          </div>
        </div>

        <UserForm 
          mode="create" 
          onSuccess={handleSuccess}
        />
      </div>
    </ListPageWrapper>
  );
}