// components/table-configs/user-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserCheck,
  UserX,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UserListItem } from "@/types/user.types";
import { useState } from "react";
import {
  getUserStatusColor,
  getUserStatusLabel,
  getRoleColor,
  getRoleLabel,
  getOrganizationTypeColor,
  getOrganizationTypeLabel,
} from "@/lib/utils/user-utils";
import Image from "next/image";

// Helper function to get user initials
function getUserInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Actions Cell Component with Navigation
function UserActionsCell({ user }: { user: UserListItem }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = () => {
    router.push(`/5am-corp/admin/users/${user.id}`);
  };

  const handleEdit = () => {
    router.push(`/5am-corp/admin/users/${user.id}/edit`);
  };

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      // Call impersonate user action
      const response = await fetch(`/api/admin/users/${user.id}/impersonate`, {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to user's dashboard or appropriate page
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      const action = user.status === "active" ? "ban" : "unban";
      const response = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the page or update state
        window.location.reload();
      }
    } catch (error) {
      console.error(
        `Failed to ${user.status === "active" ? "ban" : "unban"} user:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit user
        </DropdownMenuItem>
        {/* Super admin only - impersonate functionality */}
        <DropdownMenuItem onClick={handleImpersonate}>
          <LogIn className="mr-2 h-4 w-4" />
          Impersonate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleStatus}
          className={
            user.status === "active"
              ? "text-destructive focus:text-destructive"
              : ""
          }
        >
          {user.status === "active" ? (
            <>
              <UserX className="mr-2 h-4 w-4 text-destructive" />
              Ban user
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Unban user
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ✅ USER TABLE COLUMNS - Following exact same pattern as organization columns
export const userColumns: ColumnDef<UserListItem>[] = [
  // Avatar/Initials Column
  {
    id: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const user = row.original;
      const initials = getUserInitials(user.name);

      return (
        <div className="flex items-center space-x-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User avatar"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {initials}
            </div>
          )}
        </div>
      );
    },
  },

  // Name & Email Column
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{user.name || "Unknown User"}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      );
    },
  },

  // Role Column with Badge
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const roleColor = getRoleColor(user.role);
      const roleLabel = getRoleLabel(user.role);

      return (
        <Badge variant="outline" className={roleColor}>
          {roleLabel}
        </Badge>
      );
    },
  },

  // Organization Column with Type Badge
  {
    id: "organization",
    header: "Organization",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{user.organization}</div>
          {user.organizationType && (
            <Badge
              variant="outline"
              className={getOrganizationTypeColor(user.organizationType)}
            >
              {getOrganizationTypeLabel(user.organizationType)}
            </Badge>
          )}
        </div>
      );
    },
  },

  // Status Column (Active/Banned only)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      const statusColor = getUserStatusColor(user.status);
      const statusLabel = getUserStatusLabel(user.status);

      return (
        <Badge variant="outline" className={statusColor}>
          {statusLabel}
        </Badge>
      );
    },
  },

  // Created At Column
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const user = row.original;
      const createdAt = new Date(user.createdAt);
      return (
        <div className="text-sm">
          <div className="font-medium">{format(createdAt, "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },

  // Actions Column
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];
