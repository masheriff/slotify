// components/table-configs/member-columns.tsx
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  UserMinus,
  Shield,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { getMemberRoleLabel, MemberListItem } from "@/types/member.types";
import { removeMemberFromOrganization } from "@/actions/member-actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/types";
import {
  getMemberEmailVerifiedColor,
  getMemberEmailVerifiedLabel,
  getMemberRoleColor,
  getMemberStatusColor,
  getMemberStatusLabel,
} from "@/lib/utils/member-utils";

// Actions Cell Component with Navigation
function MemberActionsCell({ member }: { member: MemberListItem }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ EXTRACT ORGANIZATION ID FROM PATHNAME
  const organizationId = pathname.split("/")[3]; // /5am-corp/admin/organizations/{id}/members

  const handleViewDetails = () => {
    router.push(`/5am-corp/admin/organizations/${organizationId}/members/${member.id}`);
  };

  const handleEditRole = () => {
    router.push(
      `/5am-corp/admin/organizations/${organizationId}/members/${member.id}/edit`
    );
  };

  const handleRemoveMember = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${member.user.name || member.user.email} from this organization?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeMemberFromOrganization(member.id);

      if (result.success) {
        toast.success("Member removed successfully");
        router.refresh();
      } else {
        toast.error(getErrorMessage(result.error || "Failed to remove member"));
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
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
        <DropdownMenuItem onClick={handleEditRole}>
          <Shield className="mr-2 h-4 w-4" />
          Edit role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleRemoveMember}
          className="text-destructive focus:text-destructive"
        >
          <UserMinus className="mr-2 h-4 w-4" />
          Remove member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ✅ UPDATED TO USE MEMBERLISTITEM DOMAIN TYPE
export const memberColumns: ColumnDef<MemberListItem>[] = [
  // User Info (Avatar, Name, Email)
  {
    id: "user",
    header: "Member",
    cell: ({ row }) => {
      const member = row.original;
      const user = member.user;
      const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : user.email.slice(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || user.email}
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">
              {user.name || "No name"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },

  // Role
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge className={getMemberRoleColor(role)}>
          {getMemberRoleLabel(role)}
        </Badge>
      );
    },
  },

  // Status (based on user.banned or other logic)
  {
    id: "status",
    header: "Status",
    cell: () => {
      // For now, assuming all members are active unless user is banned
      // You can extend this logic based on your requirements
      const isActive = true; // !member.user.banned - if you have banned field

      return (
        <Badge className={getMemberStatusColor(isActive)}>
          {getMemberStatusLabel(isActive)}
        </Badge>
      );
    },
  },

  // Email Verified
  {
    id: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const member = row.original;
      const isVerified = member.user.emailVerified;

      return (
        <Badge className={getMemberEmailVerifiedColor(isVerified)}>
          {getMemberEmailVerifiedLabel(isVerified)}
        </Badge>
      );
    },
  },

  // Joined Date
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string;
      const joinedDate = typeof date === "string" ? new Date(date) : date;

      return (
        <div className="text-sm">
          <div className="font-medium">
            {format(joinedDate, "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(joinedDate, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },

  // Actions
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      return <MemberActionsCell member={member} />;
    },
  },
];
