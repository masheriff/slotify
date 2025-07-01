// components/table-configs/organization-columns.tsx
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
import { MoreHorizontal, Eye, Edit, Users, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Organization } from "@/types"; // ✅ Use domain type directly
import { useState } from "react";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import {
  getOrganizationStatusColor,
  getOrganizationStatusLabel,
  getOrganizationTypeColor,
  getOrganizationTypeLabel,
} from "@/lib/utils/organization-utils";
import Image from "next/image";

// Actions Cell Component with Navigation
function OrganizationActionsCell({
  organization,
}: {
  organization: Organization;
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleViewDetails = () => {
    router.push(`/5am-corp/admin/organizations/${organization.id}`);
  };

  const handleEdit = () => {
    router.push(`/5am-corp/admin/organizations/${organization.id}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/5am-corp/admin/organizations/${organization.id}/members`);
  };

  const handleDelete = () => {
    setOrganizationToDelete({
      id: organization.id,
      name: organization.name,
    });
    setDeleteDialogOpen(true);
  };

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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit organization
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleManageMembers}>
            <Users className="mr-2 h-4 w-4" />
            Manage members
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4 text-destructive" />
            Delete organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {organizationToDelete && (
        <DeleteOrganizationDialog
          organization={organizationToDelete}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setOrganizationToDelete(null);
            }
          }}
        />
      )}
    </>
  );
}

// ✅ UPDATED TO USE ORGANIZATION DOMAIN TYPE
export const organizationColumns: ColumnDef<Organization>[] = [
  // Logo Column
  {
    id: "logo",
    header: "Logo",
    enableSorting: false,
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex items-center space-x-3">
          {org.logo ? (
            <Image
              src={org.logo}
              alt={`${org.name} logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-cover rounded"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {org.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      );
    },
  },

  // Organization Name
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium">{org.name}</div>
          {org.slug && (
            <div className="text-sm text-muted-foreground">/{org.slug}</div>
          )}
        </div>
      );
    },
  },

  // Type - ✅ Extract from metadata
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.metadata?.type || "client";
      return (
        <Badge className={getOrganizationTypeColor(type)}>
          {getOrganizationTypeLabel(type)}
        </Badge>
      );
    },
  },

  // Contact Email - ✅ Extract from metadata
  {
    id: "contactEmail",
    header: "Contact Email",
    enableSorting: false,
    cell: ({ row }) => {
      const email = row.original.metadata?.contactEmail;
      return <div className="text-sm">{email || "-"}</div>;
    },
  },

  // Phone - ✅ Extract from metadata
  {
    id: "contactPhone",
    header: "Phone",
    enableSorting: false,
    cell: ({ row }) => {
      const phone = row.original.metadata?.contactPhone;
      return <div className="text-sm">{phone || "-"}</div>;
    },
  },

  // Location - ✅ Extract from metadata
  {
    id: "location",
    header: "Location",
    enableSorting: false,
    cell: ({ row }) => {
      const metadata = row.original.metadata;
      const city = metadata?.city;
      const state = metadata?.state;

      if (!city && !state) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }

      return (
        <div className="text-sm">
          {[city, state].filter(Boolean).join(", ")}
        </div>
      );
    },
  },

  // Status - ✅ Extract from metadata
  {
    id: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const isActive = row.original.metadata?.isActive !== false;
      return (
        <Badge className={getOrganizationStatusColor(isActive)}>
          {getOrganizationStatusLabel(isActive)}
        </Badge>
      );
    },
  },

  // Created Date
  {
    accessorKey: "createdAt",
    header: "Created",
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
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const organization = row.original;
      return <OrganizationActionsCell organization={organization} />;
    },
  },
];
