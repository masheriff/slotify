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
import { MoreHorizontal, Eye, Edit, UserMinus, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MemberListItem, getErrorMessage, getMemberRoleLabel, getMemberStatusColor, getMemberStatusLabel } from "@/types";
import { removeMemberFromOrganization } from "@/actions/member-actions";
import { toast } from "sonner";

// Actions Cell Component with Navigation
function MemberActionsCell({
  member,
  organizationId,
}: {
  member: MemberListItem;
  organizationId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = () => {
    router.push(`/admin/organizations/${organizationId}/members/${member.id}`);
  };

  const handleEditRole = () => {
    router.push(`/admin/organizations/${organizationId}/members/${member.id}/edit`);
  };

  const handleRemoveMember = async () => {
    if (!confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from this organization?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeMemberFromOrganization(member.id);
      
      if (result.success) {
        toast.success("Member removed successfully");
        router.refresh();
      } else {
        toast.error(getErrorMessage(result.error ?? "Failed to remove member"));
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

export const memberColumns: ColumnDef<MemberListItem>[] = [
  // 1st Column: User Info (Avatar, Name, Email)
  {
    accessorKey: "user",
    header: "Member",
    cell: ({ row }) => {
      const user = row.getValue("user") as MemberListItem["user"];
      const initials = user.name 
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user.email.slice(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
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

  // 2nd Column: Role
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant="secondary" className="text-xs">
          {getMemberRoleLabel(role)}
        </Badge>
      );
    },
  },

  // 3rd Column: Status (based on user.banned)
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const member = row.original;
      // const isActive = !member.user.banned;
      const isActive = true;
      
      return (
        <Badge 
          variant={isActive ? "default" : "destructive"}
          className="text-xs"
        >
          {getMemberStatusLabel(isActive)}
        </Badge>
      );
    },
  },

  // 4th Column: Joined Date
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm">
          <div>{format(date, "MMM dd, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },

  // 5th Column: Email Verified
  {
    id: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const user = row.original.user;
      const isVerified = !!user.emailVerified;
      
      return (
        <Badge 
          variant={isVerified ? "default" : "secondary"}
          className="text-xs"
        >
          {isVerified ? "Verified" : "Pending"}
        </Badge>
      );
    },
  },

  // 6th Column: Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <MemberActionsCell member={row.original} organizationId={row.original.organizationId} />;
    },
  },
];