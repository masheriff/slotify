// components/admin/members/member-details-content.tsx
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
  Mail,
  Calendar,
  Shield,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberWithUser } from "@/types/member.types";
import { Organization } from "@/types";

// Type for the data returned by getMemberById
interface MemberDetails {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string | null;
  };
}

interface MemberDetailsContentProps {
  member: MemberDetails;
  organization: Organization;
  organizationId: string;
  memberId: string;
}

// Helper functions for member display
function getMemberRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    system_admin: "System Admin",
    five_am_admin: "5AM Admin", 
    five_am_agent: "5AM Agent",
    client_admin: "Client Admin",
    front_desk: "Front Desk",
    technician: "Technician",
    interpreting_doctor: "Interpreting Doctor",
  };
  return roleLabels[role] || role;
}

function getMemberRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    system_admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    five_am_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    five_am_agent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    client_admin: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    front_desk: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    technician: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    interpreting_doctor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return roleColors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}

function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function getMemberStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export function MemberDetailsContent({
  member,
  organization,
  organizationId,
  memberId,
}: MemberDetailsContentProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/admin/organizations/${organizationId}/members/${memberId}/edit`);
  };

  const handleBackToMembers = () => {
    router.push(`/admin/organizations/${organizationId}/members`);
  };

  const handleBackToOrganization = () => {
    router.push(`/admin/organizations/${organizationId}`);
  };

  const isUserActive = !member.user.banned;
  const userInitials = member.user.name 
    ? member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : member.user.email.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.user.image || undefined} alt={member.user.name || member.user.email} />
            <AvatarFallback className="text-lg font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {member.user.name || member.user.email}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getMemberRoleColor(member.role)}>
                {getMemberRoleLabel(member.role)}
              </Badge>
              <Badge className={getMemberStatusColor(isUserActive)}>
                {getMemberStatusLabel(isUserActive)}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBackToMembers}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Button>
          <Button onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Member
          </Button>
        </div>
      </div>

      {/* Member Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Basic user account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="mt-1">{member.user.name || "Not provided"}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{member.user.email}</p>
                  {member.user.emailVerified && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {!member.user.emailVerified && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Status</label>
                <p className="mt-1 flex items-center gap-2">
                  {member.user.emailVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      Unverified
                    </>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>{format(new Date(member.user.createdAt), "PPP")}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(member.user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Membership */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Membership
            </CardTitle>
            <CardDescription>
              Role and membership details in {organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Organization</label>
                <div className="mt-1">
                  <Button
                    variant="link"
                    onClick={handleBackToOrganization}
                    className="p-0 h-auto font-normal text-left"
                  >
                    {organization.name}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge className={getMemberRoleColor(member.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getMemberRoleLabel(member.role)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>{format(new Date(member.createdAt), "PPP")}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Membership Status</label>
                <div className="mt-1">
                  <Badge className={getMemberStatusColor(isUserActive)}>
                    {isUserActive ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {getMemberStatusLabel(isUserActive)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Extended member details and activity summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member ID</label>
              <p className="mt-1 font-mono text-sm">{member.id}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="mt-1 font-mono text-sm">{member.userId}</p>
            </div>

            {member.user.banned && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Account Banned</label>
                <div className="flex items-center gap-2 mt-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    {member.user.banReason && (
                      <p className="text-sm text-red-600 font-medium">{member.user.banReason}</p>
                    )}
                    {member.user.banExpires && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(member.user.banExpires), "PPP")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}