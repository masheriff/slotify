// app/admin/organizations/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/admin/forms/organization-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/5am-corp/admin/organizations");
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/5am-corp/admin' },
        { label: 'Organizations', href: '/5am-corp/admin/organizations' },
        { label: 'Create', current: true },
      ]}
    >
      {/* Using consistent space-y-6 like the list page */}
      <div className="space-y-6">
        {/* Header matching FilterablePageHeader style */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Create Organization</h1>
            <p className="text-muted-foreground">
              Add a new client organization to the system
            </p>
          </div>
        </div>

        {/* Form Container - matching the layout of other pages */}
          <OrganizationForm 
            mode="create" 
            onSuccess={handleSuccess}
          />
      </div>
    </ListPageWrapper>
  );
}