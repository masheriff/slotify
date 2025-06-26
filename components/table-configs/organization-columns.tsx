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
import { format } from "date-fns";
import { MoreHorizontal, Eye, Edit, Users, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoadingControl } from "@/lib/with-loading";
import { toast } from "sonner";

// Import your organization type - adjust the import path as needed
import { OrganizationListItem } from "@/types";

import { useState } from "react";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import {
  getOrganizationStatusColor,
  getOrganizationStatusLabel,
  getOrganizationTypeColor,
  getOrganizationTypeLabel,
} from "@/lib/utils/organization-utils";

// Actions Cell Component with Navigation
function OrganizationActionsCell({
  organization,
}: {
  organization: OrganizationListItem;
}) {
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { withLoadingState } = useLoadingControl();

  const handleViewDetails = () => {
    router.push(`/admin/organizations/${organization.id}`);
  };

  const handleEdit = () => {
    router.push(`/admin/organizations/${organization.id}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/admin/organizations/${organization.id}/members`);
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

export const organizationColumns: ColumnDef<OrganizationListItem>[] = [
  // 1st Column: Organization Name
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const logo = row.original.logo;

      return (
        <div className="flex items-center space-x-3">
          {logo ? (
            <img src={logo} alt={`${name} logo`} className="h-8 object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;

      return (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.slug}
            </div>
          </div>
        </div>
      );
    },
  },

  // 2nd Column: Type
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge className={getOrganizationTypeColor(type || "client")}>
          {getOrganizationTypeLabel(type || "client")}
        </Badge>
      );
    },
  },

  // 3rd Column: Contact Email
  {
    accessorKey: "contactEmail",
    header: "Contact Email",
    cell: ({ row }) => {
      const email = row.getValue("contactEmail") as string;
      return <div className="text-sm">{email || "-"}</div>;
    },
  },

  // 4th Column: Phone
  {
    accessorKey: "contactPhone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("contactPhone") as string;
      return <div className="text-sm">{phone || "-"}</div>;
    },
  },

  // 5th Column: Location (City, State)
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => {
      const city = row.getValue("city") as string;
      const state = row.original.state;

      if (!city && !state)
        return <div className="text-sm text-muted-foreground">-</div>;

      return (
        <div className="text-sm">
          {[city, state].filter(Boolean).join(", ")}
        </div>
      );
    },
  },

  // 6th Column: Status
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge className={getOrganizationStatusColor(isActive !== false)}>
          {getOrganizationStatusLabel(isActive !== false)}
        </Badge>
      );
    },
  },

  // 7th Column: Created At
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string;
      const formattedDate =
        typeof date === "string"
          ? format(new Date(date), "MMM dd, yyyy")
          : format(date, "MMM dd, yyyy");

      return (
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      );
    },
  },

  // 8th Column: Actions (Fixed with navigation)
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original;
      return <OrganizationActionsCell organization={organization} />;
    },
  },
];
