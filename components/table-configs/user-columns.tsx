// components/table-configs/user-columns.tsx - UPDATED WITH CURRENT USER SUPPORT
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Ban, UserCheck, User, Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  type UserListItem,
  UserRole,
} from "@/types/users.types";
import {
  formatUserDisplayName,
  getUserStatus,
  getRoleLabel,
  canEditUser,
  canBanUser,
  canImpersonateUser,
} from "@/utils/users.utils";
import { getMemberRoleColor } from "@/utils/member.utils";
import { format, formatDistanceToNow } from "date-fns";
import { getOrganizationTypeColor, getOrganizationTypeLabel } from "@/utils/organization.utils";
import { BanUserDialog } from "@/components/dialogs/ban-user-dialog";
import { unbanUser } from "@/actions/users.actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/types";
import { ImpersonateUserDialog } from "../dialogs/impersonate-user-dialog";

// NEW: Interface for current user context
interface CurrentUserContext {
  role: string;
  organizationSlug?: string; // For determining edit/view URLs
}

// UPDATED: Actions Cell Component with real current user data
function UserActionsCell({ 
  user, 
  currentUser 
}: { 
  user: UserListItem; 
  currentUser: CurrentUserContext;
}) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [isUnbanLoading, setIsUnbanLoading] = useState(false);

  // FIXED: Use real current user role instead of mock
  const currentUserRole = currentUser.role;

  const userStatus = getUserStatus(user);
  const canEdit = canEditUser(currentUserRole as UserRole, user.role as UserRole);
  const canBan = canBanUser(currentUserRole as UserRole, user.role as UserRole);
  const canImpersonate = canImpersonateUser(currentUserRole as UserRole, user.role as UserRole);

  // Generate correct URLs based on context
  const getViewUrl = () => {
    if (currentUser.organizationSlug) {
      return `/${currentUser.organizationSlug}/staff/users/${user.id}`;
    }
    return `/5am-corp/admin/users/${user.id}`;
  };

  const getEditUrl = () => {
    if (currentUser.organizationSlug) {
      return `/${currentUser.organizationSlug}/staff/users/${user.id}/edit`;
    }
    return `/5am-corp/admin/users/${user.id}/edit`;
  };

  const handleUnbanUser = async () => {
    setIsUnbanLoading(true);
    try {
      const result = await unbanUser(user.id);
      if (result.success) {
        toast.success(result.message || "User unbanned successfully");
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
    window.location.reload();
  };
  
  const handleImpersonateSuccess = () => {
    console.log('Impersonation started successfully from table');
  };

  if (!canEdit && !canBan && !canImpersonate) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={getViewUrl()}>
              <Eye className="mr-2 h-4 w-4" />
              View User
            </Link>
          </DropdownMenuItem>
          
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link href={getEditUrl()}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Link>
            </DropdownMenuItem>
          )}

          {canBan && userStatus.status === "active" && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setBanDialogOpen(true)}
            >
              <Ban className="text-destructive mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}

          {canBan && userStatus.status === "banned" && (
            <DropdownMenuItem
              className="text-green-600 focus:text-green-600"
              onClick={handleUnbanUser}
              disabled={isUnbanLoading}
            >
              <UserCheck className="mr-2 h-4 w-4 text-green-600" />
              {isUnbanLoading ? "Unbanning..." : "Unban User"}
            </DropdownMenuItem>
          )}

          {canImpersonate && userStatus.status === "active" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-orange-600 focus:text-orange-600"
                onClick={() => setImpersonateDialogOpen(true)}
              >
                <UserCheck className="mr-2 h-4 w-4 text-orange-600" />
                Impersonate User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban User Dialog */}
      <BanUserDialog
        user={user}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onSuccess={handleBanSuccess}
      />

      {/* Impersonate User Dialog */}
      <ImpersonateUserDialog
        user={user}
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
        onSuccess={handleImpersonateSuccess}
      />
    </>
  );
}

// NEW: Function to create user columns with current user context
export function createUserColumns(currentUser: CurrentUserContext): ColumnDef<UserListItem>[] {
  return [
    {
      accessorKey: "avatar",
      header: "Avatar",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        const initials =
          user && user.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : user && user.email
              ? user.email
                  .split("@")[0]
                  .slice(0, 2)
                  .toUpperCase()
              : "U";

        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{formatUserDisplayName(user)}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge
            variant="outline"
            className={getMemberRoleColor(user.role as any)}
          >
            {getRoleLabel(user.role as UserRole)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }) => {
        const user = row.original;
        
        if (!user.organization) {
          return <span className="text-muted-foreground">No organization</span>;
        }

        const org = user.organization;
        const orgType = org.type || 'client';
        
        return (
          <div className="space-y-1">
            <div className="font-medium">{org.name}</div>
            <Badge
              variant="outline"
              className={getOrganizationTypeColor(orgType)}
            >
              {getOrganizationTypeLabel(orgType)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        const userStatus = getUserStatus(user);

        return <Badge className={userStatus.className}>{userStatus.label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm">
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        return <UserActionsCell user={user} currentUser={currentUser} />;
      },
    },
  ];
}

// LEGACY: Keep the old export for backward compatibility
// This should be gradually replaced with createUserColumns
export const userColumns = createUserColumns({ role: "system_admin" });