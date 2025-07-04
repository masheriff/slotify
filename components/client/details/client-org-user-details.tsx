// components/client/details/client-org-user-details.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Edit,
  Mail,
  Calendar,
  Shield,
  Ban,
  UserCheck,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type UserListItem } from "@/types/users.types";
import { type UserRole } from "@/types/users.types";
import {
  formatUserDisplayName,
  getUserStatus,
  getRoleLabel,
  canEditUser,
  canBanUser,
  canViewUser,
} from "@/utils/users.utils";
import { getMemberRoleColor } from "@/utils/member.utils";
import { BanUserDialog } from "@/components/dialogs/ban-user-dialog";
import { unbanUser } from "@/actions/users.actions";
import { toast } from "sonner";
import { getErrorMessage, Organization } from "@/types";

interface ClientOrgUserDetailsProps {
  user: UserListItem;
  currentUser: {
    id: string;
    role: string;
    email: string;
    name?: string;
  };
  organization: Organization;
  organizationSlug: string;
}

export function ClientOrgUserDetails({
  user,
  currentUser,
  organization,
  organizationSlug,
}: ClientOrgUserDetailsProps) {
  const router = useRouter();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [isUnbanLoading, setIsUnbanLoading] = useState(false);

  const userStatus = getUserStatus(user);
  const canEdit = canEditUser(currentUser.role as UserRole, user.role as UserRole);
  const canBan = canBanUser(currentUser.role as UserRole, user.role as UserRole);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email
      ? user.email.slice(0, 2).toUpperCase()
      : "U";

  const handleEdit = () => {
    router.push(`/${organizationSlug}/staff/users/${user.id}/edit`);
  };

  const handleBack = () => {
    router.push(`/${organizationSlug}/staff/users`);
  };

  const handleUnbanUser = async () => {
    setIsUnbanLoading(true);
    try {
      const result = await unbanUser(user.id);
      if (result.success) {
        toast.success(result.message || "User unbanned successfully");
        router.refresh();
      } else {
        toast.error(getErrorMessage(result.error || "Failed to unban user"));
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUnbanLoading(false);
    }
  };

  const handleBanSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {formatUserDisplayName(user)}
            </h1>
            <p className="text-muted-foreground">Staff Member Details</p>
          </div>
        </div>

        {/* Actions Dropdown */}
        {(canEdit || canBan) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Staff Member
                </DropdownMenuItem>
              )}

              {canBan && userStatus.status === "active" && (
                <>
                  {canEdit && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setBanDialogOpen(true)}
                  >
                    <Ban className="text-destructive mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                </>
              )}

              {canBan && userStatus.status === "banned" && (
                <>
                  {canEdit && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="text-green-600 focus:text-green-600"
                    onClick={handleUnbanUser}
                    disabled={isUnbanLoading}
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                    {isUnbanLoading ? "Unbanning..." : "Unban User"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {formatUserDisplayName(user)}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={userStatus.className}>
                  {userStatus.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={getMemberRoleColor(user.role as any)}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {getRoleLabel(user.role as UserRole)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Basic user details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="mt-1">{user.name || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge className={userStatus.className}>
                  {userStatus.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization & Role */}
        <Card>
          <CardHeader>
            <CardTitle>Organization & Role</CardTitle>
            <CardDescription>
              Role and permissions within the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Organization
              </label>
              <p className="mt-1">{organization.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={getMemberRoleColor(user.role as any)}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {getRoleLabel(user.role as UserRole)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member Since
              </label>
              <p className="mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(user.createdAt), "MMMM dd, yyyy")} (
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status (if banned) */}
        {user.banned && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-destructive">Account Status</CardTitle>
              <CardDescription>
                This account has been restricted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ban Reason
                </label>
                <p className="mt-1">{user.banReason || "No reason provided"}</p>
              </div>
              {user.banExpires && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ban Expires
                  </label>
                  <p className="mt-1">
                    {format(new Date(user.banExpires), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ban User Dialog */}
      <BanUserDialog
        user={user}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onSuccess={handleBanSuccess}
      />
    </div>
  );
}