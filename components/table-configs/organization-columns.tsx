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
import { OrganizationListItem } from "@/types"

export const organizationColumns: ColumnDef<OrganizationListItem>[] = [
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
      const type = row.getValue("type") as "admin" | "client"
      
      return (
        <Badge variant={type === "admin" ? "default" : "secondary"}>
          {type === "admin" ? "Admin Organization" : "Client Organization"}
        </Badge>
      )
    },
  },

  // 4th Column: Contact Info
  {
    accessorKey: "contactEmail",
    header: "Contact",
    cell: ({ row }) => {
      const email = row.getValue("contactEmail") as string
      const phone = row.original.contactPhone
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{email || "—"}</div>
          <div className="text-xs text-muted-foreground">{phone || "—"}</div>
        </div>
      )
    },
  },

  // 5th Column: Location
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => {
      const city = row.getValue("city") as string
      const state = row.original.state
      
      return (
        <div className="text-sm">
          {city && state ? `${city}, ${state}` : city || state || "—"}
        </div>
      )
    },
  },

  // 6th Column: Status
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },

  // 7th Column: Created At
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | string
      const formattedDate = typeof date === 'string' ? 
        format(new Date(date), "MMM dd, yyyy") : 
        format(date, "MMM dd, yyyy")
      
      return (
        <div className="text-sm text-muted-foreground">
          {formattedDate}
        </div>
      )
    },
  },

  // 8th Column: Actions
  {
    id: "actions",
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit organization
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Manage members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]