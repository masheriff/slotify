// components/admin/organization/organization-details-content.tsx
"use client";

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
import {
  Edit,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  UserPlus,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getOrganizationTypeColor,
  getOrganizationStatusColor,
  getOrganizationTypeLabel,
  getOrganizationStatusLabel,
} from "@/utils/organization.utils";
import { OrganizationDetailsContentProps, OrganizationMetadata } from "@/types";
import Image from "next/image";


export function OrganizationDetailsContent({
  organization,
  organizationId,
}: OrganizationDetailsContentProps) {
  const router = useRouter();
  console.log(organization, "organization from individual orgs");

  const metadata = organization.metadata as OrganizationMetadata;

  const handleEdit = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}/members`);
  };

  const handleInviteUser = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}/members/invite`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Simple design without slug */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {organization.logo ? (
            <Image
              src={organization.logo}
              alt={organization.name}
              width={0}
              height={0}
              sizes="100vw"
              className="h-8 w-auto object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {organization.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={getOrganizationTypeColor(metadata?.type || "client")}
              >
                {getOrganizationTypeLabel(metadata?.type || "client")}
              </Badge>
              <Badge
                className={getOrganizationStatusColor(
                  metadata?.isActive !== false
                )}
              >
                {getOrganizationStatusLabel(metadata?.isActive !== false)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons - All three buttons are preserved */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInviteUser}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageMembers}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Members
            {/* {organization.memberCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {organization.memberCount}
              </Badge>
            )} */}
          </Button>
          <Button size="sm" onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Organization
          </Button>
        </div>
      </div>

      {/* Organization Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date(organization.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {organization.updatedAt
                    ? formatDistanceToNow(new Date(organization.updatedAt), {
                        addSuffix: true,
                      })
                    : "Never updated"}
                </p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <p className="text-muted-foreground">
                  {getOrganizationTypeLabel(metadata?.type || "client")}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-muted-foreground">
                  {getOrganizationStatusLabel(metadata?.isActive !== false)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach this organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Email and Phone Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {metadata?.contactEmail || "No email provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {metadata?.contactPhone || "No phone provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Column */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {metadata?.addressLine1 ? (
                        <>
                          {metadata.addressLine1}
                          {metadata.addressLine2 && (
                            <>
                              <br />
                              {metadata.addressLine2}
                            </>
                          )}
                          <br />
                          {metadata.city}, {metadata.state}{" "}
                          {metadata.postalCode}
                          <br />
                          {metadata.country}
                        </>
                      ) : (
                        "No address provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HIPAA & Compliance */}
        {metadata?.hipaaOfficer && (
          <Card>
            <CardHeader>
              <CardTitle>HIPAA & Compliance</CardTitle>
              <CardDescription>
                Compliance and security information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">HIPAA Officer</p>
                      <p className="text-muted-foreground">
                        {metadata.hipaaOfficer}
                      </p>
                    </div>
                  </div>
                </div>

                {metadata.dataRetentionYears && (
                  <div>
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Data Retention</p>
                        <p className="text-muted-foreground">
                          {metadata.dataRetentionYears} years
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-start space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">BAA Status</p>
                      <p className="text-muted-foreground">
                        {metadata.businessAssociateAgreement
                          ? "Signed"
                          : "Not signed"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings & Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Settings & Configuration</CardTitle>
            <CardDescription>
              Organization settings and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Timezone</p>
                <p className="text-muted-foreground">
                  {metadata?.timezone || "Not configured"}
                </p>
              </div>

              {metadata?.settings?.features && (
                <div>
                  <p className="font-medium">Enabled Features</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(metadata.settings.features)
                      .map(([feature]) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
