// app/admin/organizations/[id]/members/invite/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MemberForm } from "@/components/admin/forms/member-form";
import { ListPageWrapper } from "@/components/layouts/list-page-wrapper";
import { InviteMemberPageProps } from "@/types";



export default function InviteMemberPage({ params }: InviteMemberPageProps) {
  const router = useRouter();
  
  // Use React.use() to unwrap the Promise as required by Next.js latest
  const { id: organizationId } = use(params);

  const handleSuccess = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}/members`);
  };

  return (
    <ListPageWrapper
      breadcrumbs={[
        { label: 'Admin', href: '/5am-corp/admin' },
        { label: 'Organizations', href: '/5am-corp/admin/organizations' },
        { label: 'Organization', href: `/5am-corp/admin/organizations/${organizationId}` },
        { label: 'Members', href: `/5am-corp/admin/organizations/${organizationId}/members` },
        { label: 'Invite Member', current: true },
      ]}
    >
      {/* Using consistent space-y-6 like the list page */}
      <div className="space-y-6">
        {/* Header matching FilterablePageHeader style */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Invite Member</h1>
            <p className="text-muted-foreground">
              Send an invitation to add a new member to this organization
            </p>
          </div>
        </div>

        {/* Form Container - matching the layout of other pages */}
        <MemberForm 
          mode="create"
          organizationId={organizationId}
          onSuccess={handleSuccess}
        />
      </div>
    </ListPageWrapper>
  );
}