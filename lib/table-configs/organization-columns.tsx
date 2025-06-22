// lib/table-configs/organization-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

// Organization type definition
export interface Organization {
  id: string
  name: string
  type: 'admin' | 'client'
  status: 'active' | 'inactive' | 'suspended'
  memberCount: number
  createdAt: string
  contactEmail: string
}

export const organizationColumns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const organization = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{organization.name}</span>
          <span className="text-sm text-muted-foreground">{organization.contactEmail}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "admin" ? "default" : "secondary"}>
          {type === "admin" ? "Admin" : "Client"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={
            status === "active" 
              ? "default" 
              : status === "inactive" 
              ? "secondary" 
              : "destructive"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "memberCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const memberCount = row.getValue("memberCount") as number
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{memberCount}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string
      // Use consistent date formatting to avoid hydration errors
      return new Date(createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const organization = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(organization.id)}
            >
              Copy organization ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Navigate to organization details
                window.location.href = `/admin/organizations/${organization.id}`
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Navigate to edit organization
                window.location.href = `/admin/organizations/${organization.id}/edit`
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit organization
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Navigate to members
                window.location.href = `/admin/organizations/${organization.id}/members`
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${organization.name}?`)) {
                  // Handle delete
                  toast.success(`${organization.name} has been deleted`)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]