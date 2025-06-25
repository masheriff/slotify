// components/table-configs/organization-columns.tsx - FIXED VERSION
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
import { MoreHorizontal, Eye, Edit, Users } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { OrganizationTableRow } from "@/types/organization.types"

export const organizationColumns: ColumnDef<OrganizationTableRow>[] = [
  // 1st Column: Logo + Name
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const logo = row.original.logo
      
      return (
        <div className="flex items-center space-x-3">
          {logo ? (
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={logo}
                alt={`${name} logo`}
                fill
                className="object-contain rounded-md"
                sizes="40px"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{name}</div>
          </div>
        </div>
      )
    },
  },

  // 2nd Column: Slug
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string
      
      return (
        <div className="text-sm font-mono text-muted-foreground">
          {slug ? `/${slug}` : "—"}
        </div>
      )
    },
  },

  // 3rd Column: Organization Type
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      // Get type from metadata
      const metadata = row.original.metadata
      const type = metadata?.type
      
      return (
        <Badge variant={type === "admin" ? "default" : "secondary"}>
          {type === "admin" ? "Admin Organization" : "Client Organization"}
        </Badge>
      )
    },
  },

  // 4th Column: Created At
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string
      const formattedDate = typeof date === 'string' ? new Date(date) : date
      
      return (
        <div className="text-sm">
          {format(formattedDate, "MMM dd, yyyy")}
        </div>
      )
    },
  },

  // Actions Column
  {
    id: "actions",
    header: "Actions",
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
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => window.open(`/admin/organizations/${organization.id}`, '_self')}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => window.open(`/admin/organizations/${organization.id}/edit`, '_self')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Organization
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => window.open(`/admin/organizations/${organization.id}/members/invite`, '_self')}
            >
              <Users className="mr-2 h-4 w-4" />
              Invite Members
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => window.open(`/admin/organizations/${organization.id}/members`, '_self')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]