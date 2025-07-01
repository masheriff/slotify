// Updated user-columns.tsx with consistent date formatting and member badge colors
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, UserX, UserCheck } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { UserListItem } from "@/types/user.types";
import { 
  getUserDisplayName, 
  getUserInitials,
  getUserStatusText
} from "@/lib/utils/user-utils";
import { 
  getMemberRoleColor,
  getMemberRoleLabel,
  getMemberStatusColor,
  getMemberStatusLabel
} from "@/lib/utils/member-utils";

export const userColumns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="text-xs">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{getUserDisplayName(user)}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "primaryRole",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          {user.primaryRole && (
            <Badge className={getMemberRoleColor(user.primaryRole)}>
              {getMemberRoleLabel(user.primaryRole)}
            </Badge>
          )}
          {user.membershipCount > 1 && (
            <div className="text-xs text-muted-foreground">
              +{user.membershipCount - 1} more
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "primaryOrganizationName",
    header: "Organization",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          {user.primaryOrganizationName && (
            <div className="font-medium text-sm">{user.primaryOrganizationName}</div>
          )}
          {user.membershipCount > 1 && (
            <div className="text-xs text-muted-foreground">
              {user.membershipCount} total memberships
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      const isActive = !user.banned;
      return (
        <div className="flex flex-col space-y-1">
          <Badge className={getMemberStatusColor(isActive)}>
            {getMemberStatusLabel(isActive)}
          </Badge>
          {!user.emailVerified && (
            <Badge variant="secondary" className="text-xs">
              Email Not Verified
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string;
      const createdDate = typeof date === "string" ? new Date(date) : date;

      return (
        <div className="text-sm">
          <div className="font-medium">
            {format(createdDate, "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdDate, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const user = row.original;
      if (!user.updatedAt) {
        return (
          <div className="text-sm text-muted-foreground">
            Never
          </div>
        );
      }

      const date = typeof user.updatedAt === "string" ? new Date(user.updatedAt) : user.updatedAt;

      return (
        <div className="text-sm">
          <div className="font-medium">
            {format(date, "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href={`/5am-corp/admin/users/${user.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href={`/5am-corp/admin/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {user.banned ? (
              <DropdownMenuItem>
                <UserCheck className="h-4 w-4 mr-2" />
                Unban User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <UserX className="h-4 w-4 mr-2" />
                Ban User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];