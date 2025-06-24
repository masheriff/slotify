// app/admin/organizations/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Edit,
  Users,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getOrganizationById } from "@/actions/organization-actions";

export default async function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

      const { slug } = await params

  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrganization();
  }, [slug]);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const result = await getOrganizationById(await slug);

      if (result.success && result.data) {
        setOrganization(result.data);
      } else {
        toast.error("Organization not found");
        router.push("/admin/organizations");
      }
    } catch (error) {
      toast.error("Failed to load organization");
      router.push("/admin/organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/organizations/${slug}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/admin/organizations/${slug}/members`);
  };

  const handleBack = () => {
    router.push("/admin/organizations");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading organization...
          </p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const metadata = organization.metadata || {};

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
              Organization Details
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
                <BreadcrumbPage>{organization.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleManageMembers}>
            <Users className="mr-2 h-4 w-4" />
            Manage Members
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Organization
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={organization.logo}
                  alt={`${organization.name} logo`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                  {organization.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{organization.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      metadata.type === "admin" ? "default" : "secondary"
                    }
                  >
                    {metadata.type === "admin"
                      ? "Admin Organization"
                      : "Client Organization"}
                  </Badge>
                  <Badge variant={metadata.isActive ? "default" : "secondary"}>
                    {metadata.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardTitle>
            {organization.slug && (
              <CardDescription>Slug: {organization.slug}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(organization.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Members
                </dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {organization.members?.length || 0} members
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${metadata.contactEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {metadata.contactEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Phone
                </dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${metadata.contactPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {metadata.contactPhone}
                  </a>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" />
              <div className="text-sm">
                <div>{metadata.addressLine1}</div>
                {metadata.addressLine2 && <div>{metadata.addressLine2}</div>}
                <div>
                  {metadata.city}, {metadata.state} {metadata.postalCode}
                </div>
                <div>{metadata.country}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Compliance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Timezone
                  </dt>
                  <dd className="text-sm">{metadata.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Data Retention
                  </dt>
                  <dd className="text-sm">
                    {metadata.dataRetentionYears || 7} years
                  </dd>
                </div>
                {metadata.settings?.features && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Features
                    </dt>
                    <dd className="flex flex-wrap gap-1 mt-1">
                      {/* {Object.entries(metadata.settings.features).map(([feature, enabled]) => (
                        enabled && (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Badge>
                        )
                      ))} */}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HIPAA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {metadata.hipaaOfficer && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      HIPAA Officer
                    </dt>
                    <dd className="text-sm">{metadata.hipaaOfficer}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Business Associate Agreement
                  </dt>
                  <dd>
                    <Badge
                      variant={
                        metadata.businessAssociateAgreement
                          ? "default"
                          : "secondary"
                      }
                    >
                      {metadata.businessAssociateAgreement
                        ? "Signed"
                        : "Not Signed"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
