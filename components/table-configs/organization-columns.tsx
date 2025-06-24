// lib/table-configs/organization-columns.tsx - Updated with proper type handling and actions
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
import { MoreHorizontal, Eye, Edit, Users, Mail, Phone, MapPin } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { OrganizationMetadata } from "@/types"

// Organization type for table display
interface OrganizationTableRow {
  id: string
  name: string
  slug?: string
  logo?: string
  createdAt: Date | string
  metadata: OrganizationMetadata
  type?: string // Computed field from metadata
  isActive?: boolean // Computed field from metadata
  contactEmail?: string // Computed field from metadata
}

export const organizationColumns: ColumnDef<OrganizationTableRow>[] = [
  // Logo and Name Column
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const logo = row.original.logo
      const slug = row.original.slug
      
      return (
        <div className="flex items-center space-x-3">
          {logo ? (
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={logo}
                alt={`${name} logo`}
                fill
                className="object-contain" // NOT rounded - as requested
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
            {slug && (
              <div className="text-sm text-muted-foreground">/{slug}</div>
            )}
          </div>
        </div>
      )
    },
  },

  // Type Column - FIXED to read from metadata
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      // Get type from metadata or computed field
      const metadata = row.original.metadata
      const type = metadata?.type || row.original.type
      
      return (
        <Badge variant={type === "admin" ? "default" : "secondary"}>
          {type === "admin" ? "Admin Organization" : "Client Organization"}
        </Badge>
      )
    },
  },

  // Contact Information Column
  {
    accessorKey: "contactEmail",
    header: "Contact",
    cell: ({ row }) => {
      const metadata = row.original.metadata
      const email = metadata?.contactEmail
      const phone = metadata?.contactPhone
      const city = metadata?.city
      const state = metadata?.state
      
      return (
        <div className="space-y-1">
          {email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{phone}</span>
            </div>
          )}
          {city && state && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{city}, {state}</span>
            </div>
          )}
        </div>
      )
    },
  },

  // Status Column
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const metadata = row.original.metadata
      const isActive = metadata?.isActive ?? true
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },

  // Created Date Column
  {
    accessorKey: "createdAt",
    header: "Created",
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

  // Actions Column - UPDATED per requirements
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
            
            {/* Invite Members - renamed from "Send Invitation" as requested */}
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
            
            {/* NO DELETE OPTION - removed as requested */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]