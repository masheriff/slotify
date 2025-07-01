// app/admin/organizations/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/admin/forms/organization-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { EditOrganizationPageProps } from "@/types";



export default function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const router = useRouter();
  
  // Use React.use() to unwrap the Promise as required by Next.js latest
  const { id: organizationId } = use(params);

  const handleSuccess = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}`);
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/5am-corp/admin' },
        { label: 'Organizations', href: '/5am-corp/admin/organizations' },
        { label: 'Organization Details', href: `/5am-corp/admin/organizations/${organizationId}` },
        { label: 'Edit', current: true },
      ]}
    >
      {/* Using consistent space-y-6 like the list page */}
      <div className="space-y-6">
        {/* Header matching FilterablePageHeader style */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Organization</h1>
            <p className="text-muted-foreground">
              Update organization information and settings
            </p>
          </div>
        </div>

        {/* Form Container - matching the layout of other pages */}
          <OrganizationForm 
            mode="edit"
            organizationId={organizationId}
            onSuccess={handleSuccess}
          />
      </div>
    </ListPageWrapper>
  );
}