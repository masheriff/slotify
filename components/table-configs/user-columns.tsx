// components/table-configs/user-columns.tsx
"use client";

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

import {
  type UserListItem,
  ADMIN_ORG_ROLES,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMemberRoleColor } from "@/utils/member.utils";
import { format, formatDistanceToNow } from "date-fns";
import { getOrganizationTypeColor, getOrganizationTypeLabel } from "@/utils/organization.utils";

export const userColumns: ColumnDef<UserListItem>[] = [
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
            ? user.email.slice(0, 2).toUpperCase()
            : "";
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user?.image || undefined}
            alt={user?.name || user?.email || ""}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return <div className="font-medium">{formatUserDisplayName(user)}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <div className="lowercase">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge className={getMemberRoleColor(role)}>
          {getRoleLabel(role as UserRole)}
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

      return (
        <div className="flex flex-col gap-1">
          <span>{user.organization.name}</span>
          <span className="text-muted-foreground capitalize">
                    <Badge className={getOrganizationTypeColor(user.organization.type)}>
                      {getOrganizationTypeLabel(user.organization.type)}
                    </Badge>
          </span>
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

      // Mock current user role - in real app this would come from auth context
      const currentUserRole = ADMIN_ORG_ROLES.SYSTEM_ADMIN;

      const userStatus = getUserStatus(user);
      const canEdit = canEditUser(currentUserRole as any, user.role as any);
      const canBan = canBanUser(currentUserRole as any, user.role as any);
      const canImpersonate = canImpersonateUser(
        currentUserRole as any,
        user.role as any
      );

      if (!canEdit && !canBan && !canImpersonate) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/5am-corp/admin/users/${user.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View User
                </Link>
              </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/5am-corp/admin/users/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </Link>
              </DropdownMenuItem>
            )}

            {canBan && userStatus.status === "active" && (
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Ban className="text-destructive mr-2 h-4 w-4" />
                Ban User
              </DropdownMenuItem>
            )}

            {canBan && userStatus.status === "banned" && (
              <DropdownMenuItem className="text-green-600 focus:text-green-600">
                <UserCheck className="mr-2 h-4 w-4" />
                Unban User
              </DropdownMenuItem>
            )}

            {canImpersonate && userStatus.status === "active" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-orange-600 focus:text-orange-600">
                  <User className="text-orange-600 mr-2 h-4 w-4" />
                  Impersonate User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
