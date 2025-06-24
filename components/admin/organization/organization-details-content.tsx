// app/admin/organizations/[id]/organization-details-content.tsx
"use client";

import { useRouter } from "next/navigation";
import { useLoadingControl } from "@/lib/with-loading";
import { Button } from "@/components/ui/button";
import { DetailsPageHeader, DetailsPageHeaderAction } from "@/components/common/details-page-header";
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
  Edit,
  Users,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Settings,
  UserPlus,
  Shield,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface OrganizationDetailsContentProps {
  organization: any; // Type this according to your organization type
  organizationId: string;
}

export function OrganizationDetailsContent({ 
  organization, 
  organizationId 
}: OrganizationDetailsContentProps) {
  const router = useRouter();
  const { withLoadingState, isLoading } = useLoadingControl();
  
  const metadata = organization.metadata as any;
  
  const handleEdit = () => {
    withLoadingState(
      'organization-edit-navigation',
      async () => {
        router.push(`/admin/organizations/${organizationId}/edit`);
      },
      'Navigating to edit page...'
    );
  };

  const handleManageMembers = () => {
    withLoadingState(
      'organization-members-navigation',
      async () => {
        router.push(`/admin/organizations/${organizationId}/members`);
      },
      'Loading members page...'
    );
  };

  const handleBack = () => {
    withLoadingState(
      'organization-back-navigation',
      async () => {
        router.push("/admin/organizations");
      },
      'Returning to organizations...'
    );
  };

  const handleInviteUser = () => {
    withLoadingState(
      'organization-invite-navigation',
      async () => {
        router.push(`/admin/organizations/${organizationId}/invite`);
      },
      'Loading invite page...'
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "client":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  };

  // Prepare header actions
  const headerActions: DetailsPageHeaderAction[] = [
    {
      label: "Invite User",
      onClick: handleInviteUser,
      icon: UserPlus,
      variant: "outline",
      loadingKey: "organization-invite-navigation",
      loadingText: "Loading...",
    },
    {
      label: "Manage Members",
      onClick: handleManageMembers,
      icon: Users,
      variant: "outline",
      loadingKey: "organization-members-navigation",
      loadingText: "Loading...",
    },
    {
      label: "Edit Organization",
      onClick: handleEdit,
      icon: Edit,
      loadingKey: "organization-edit-navigation",
      loadingText: "Loading...",
    },
  ];

  // Prepare header badges
  const headerBadges = [
    {
      label: metadata?.type === "admin" ? "Admin Organization" : "Client Organization",
      color: getTypeColor(metadata?.type || "client"),
    },
    {
      label: metadata?.isActive !== false ? "Active" : "Inactive",
      color: getStatusColor(metadata?.isActive !== false),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailsPageHeader
        title={organization.name}
        subtitle={organization.slug}
        avatar={{
          src: organization.logo,
          fallback: organization.name.charAt(0).toUpperCase(),
        }}
        badges={headerBadges}
        breadcrumbItems={[
          { title: "Organizations", href: "/admin/organizations" },
          { title: organization.name },
        ]}
        actions={headerActions}
        onBack={handleBack}
      />

      {/* Organization Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Type</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getTypeColor(metadata?.type || "client")}>
              {metadata?.type === "admin" ? "Admin Organization" : "Client Organization"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(metadata?.isActive !== false)}>
              {metadata?.isActive !== false ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.members?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total members
            </p>
          </CardContent>
        </Card>
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
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={organization.logo} alt={organization.name} />
                <AvatarFallback className="text-lg">
                  {organization.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{organization.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {organization.slug}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Created</p>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date(organization.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {organization.updatedAt 
                    ? formatDistanceToNow(new Date(organization.updatedAt), { addSuffix: true })
                    : "Never"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How to reach this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metadata?.contactEmail && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {metadata.contactEmail}
                  </p>
                </div>
              </div>
            )}
            
            {metadata?.contactPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {metadata.contactPhone}
                  </p>
                </div>
              </div>
            )}
            
            {(metadata?.addressLine1 || metadata?.city) && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <div className="text-sm text-muted-foreground">
                    {metadata?.addressLine1 && <p>{metadata.addressLine1}</p>}
                    {metadata?.addressLine2 && <p>{metadata.addressLine2}</p>}
                    {(metadata?.city || metadata?.state || metadata?.postalCode) && (
                      <p>
                        {[metadata?.city, metadata?.state, metadata?.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {metadata?.country && <p>{metadata.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HIPAA & Compliance */}
        {(metadata?.hipaaOfficer || metadata?.businessAssociateAgreement || metadata?.dataRetentionYears) && (
          <Card>
            <CardHeader>
              <CardTitle>HIPAA & Compliance</CardTitle>
              <CardDescription>
                Healthcare compliance information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata?.hipaaOfficer && (
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">HIPAA Officer</p>
                    <p className="text-sm text-muted-foreground">
                      {metadata.hipaaOfficer}
                    </p>
                  </div>
                </div>
              )}
              
              {metadata?.dataRetentionYears && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data Retention</p>
                    <p className="text-sm text-muted-foreground">
                      {metadata.dataRetentionYears} years
                    </p>
                  </div>
                </div>
              )}
              
              {metadata?.businessAssociateAgreement && (
                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">BAA Status</p>
                    <Badge variant="secondary">
                      Business Associate Agreement Signed
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Settings & Features */}
        {metadata?.settings && (
          <Card>
            <CardHeader>
              <CardTitle>Features & Settings</CardTitle>
              <CardDescription>
                Enabled features and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadata.settings.features && (
                <div>
                  <p className="text-sm font-medium mb-2">Enabled Features</p>
                  <div className="flex flex-wrap gap-2">
                    {metadata.settings.features.multiTenant && (
                      <Badge variant="outline">Multi-Tenant</Badge>
                    )}
                    {metadata.settings.features.advancedReporting && (
                      <Badge variant="outline">Advanced Reporting</Badge>
                    )}
                    {metadata.settings.features.apiAccess && (
                      <Badge variant="outline">API Access</Badge>
                    )}
                    {metadata.settings.features.customBranding && (
                      <Badge variant="outline">Custom Branding</Badge>
                    )}
                  </div>
                </div>
              )}
              
              {metadata.settings.billing && (
                <div>
                  <p className="text-sm font-medium mb-2">Billing Information</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Plan: {metadata.settings.billing.plan}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={metadata.settings.billing.status === 'active' 
                        ? 'border-green-300 text-green-700' 
                        : 'border-red-300 text-red-700'
                      }
                    >
                      Status: {metadata.settings.billing.status}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members Preview */}
      {organization.members && organization.members.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Members</CardTitle>
              <CardDescription>
                Latest members added to this organization
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageMembers}
              loadingKey="organization-members-navigation"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organization.members.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.user?.name?.charAt(0) || member.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.user?.name || member.email || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.user?.email || member.email}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}