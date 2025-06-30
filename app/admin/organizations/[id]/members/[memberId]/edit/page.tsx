// app/admin/organizations/[id]/members/[memberId]/edit/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MemberForm } from "@/components/admin/forms/member-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";

interface EditMemberPageProps {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const router = useRouter();
  
  // Use React.use() to unwrap the Promise as required by Next.js latest
  const { id: organizationId, memberId } = use(params);

  const handleSuccess = () => {
    router.push(`/admin/organizations/${organizationId}/members/${memberId}`);
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Organizations', href: '/admin/organizations' },
        { label: 'Organization', href: `/admin/organizations/${organizationId}` },
        { label: 'Members', href: `/admin/organizations/${organizationId}/members` },
        { label: 'Member', href: `/admin/organizations/${organizationId}/members/${memberId}` },
        { label: 'Edit', current: true },
      ]}
    >
      {/* Using consistent space-y-6 like the list page */}
      <div className="space-y-6">
        {/* Header matching FilterablePageHeader style */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
            <p className="text-muted-foreground">
              Update member role and permissions
            </p>
          </div>
        </div>

        {/* Form Container - matching the layout of other pages */}
        <MemberForm 
          mode="edit"
          organizationId={organizationId}
          memberId={memberId}
          onSuccess={handleSuccess}
        />
      </div>
    </ListPageWrapper>
  );
}