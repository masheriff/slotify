// app/admin/organizations/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/admin/forms/organization-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/organizations");
  };

  const handleBack = () => {
    router.push("/admin/organizations");
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Organization
            </h2>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/organizations">
                  Organizations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Form */}
      <OrganizationForm mode="create" />
    </div>
  );
}
