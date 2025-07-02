// components/admin/user/user-details-content.tsx
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
  Building,
  User,
  Ban,
  UserCheck,
  Eye,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserListItem, UserRole } from "@/types/users.types";
import { getRoleLabel, getUserStatus } from "@/utils/users.utils";
import {
  getOrganizationTypeColor,
  getOrganizationTypeLabel,
} from "@/utils/organization.utils";
import { getMemberRoleColor } from "@/utils/member.utils";

interface UserDetailsContentProps {
  user: UserListItem;
  userId: string;
}

export function UserDetailsContent({ user, userId }: UserDetailsContentProps) {
  const userStatus = getUserStatus(user);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/5am-corp/admin/users/${userId}/edit`);
  };

  const handleViewOrganization = () => {
    if (user.organization) {
      router.push(`/5am-corp/admin/organizations/${user.organization.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || ""} alt={user.name ?? undefined} />
            <AvatarFallback>
              {(user.name ?? "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getMemberRoleColor(user.role ?? "")}>
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(user.role as UserRole)}
              </Badge>
              <Badge className={userStatus.className}>
                {userStatus.status === "banned" ? (
                  <Ban className="h-3 w-3 mr-1" />
                ) : (
                  <UserCheck className="h-3 w-3 mr-1" />
                )}
                {userStatus.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {user.organization && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOrganization}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Organization
            </Button>
          )}
          <Button size="sm" onClick={handleEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-[2px] text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4  mt-[2px] text-muted-foreground" />
                <div>
                  <p className="font-medium">Full Name</p>
                  <p className="text-muted-foreground">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4  mt-[2px] text-muted-foreground" />
                <div>
                  <p className="font-medium">Role</p>
                  <Badge className={getMemberRoleColor(user.role ?? "")}>
                    {getRoleLabel(user.role as UserRole)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Organization membership and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.organization ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4  mt-[5px] text-muted-foreground" />
                  <div>
                    <p className="font-medium">Organization</p>
                    <p className="text-muted-foreground">
                      {user.organization.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Organization Type</p>
                  <Badge
                    className={getOrganizationTypeColor(user.organization.type)}
                  >
                    {getOrganizationTypeLabel(user.organization.type)}
                  </Badge>
                </div>

                {user.member && (
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-muted-foreground">
                      {format(new Date(user.member.createdAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.member.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No organization assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Current account status and restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Account Status</p>
                <Badge className={userStatus.className}>
                  {userStatus.label}
                </Badge>
              </div>

              {user.banned && user.banReason && (
                <div>
                  <p className="font-medium">Ban Reason</p>
                  <p className="text-muted-foreground text-sm">
                    {user.banReason}
                  </p>
                </div>
              )}

              {user.banned && user.banExpires && (
                <div>
                  <p className="font-medium">Ban Expires</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(user.banExpires), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Information */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Account creation and modification history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-[5px] text-muted-foreground" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {user.updatedAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-[5px] text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">
                      {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(user.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
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
