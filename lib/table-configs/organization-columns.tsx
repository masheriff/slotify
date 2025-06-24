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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Users, Mail } from "lucide-react"
import { toast } from "sonner"
import { OrganizationColumns } from "@/types"

export const organizationColumns: ColumnDef<OrganizationColumns>[] = [
  // Logo Column
  {
    accessorKey: "logo",
    header: "Logo",
    enableSorting: false,
    cell: ({ row }) => {
      const organization = row.original
      const firstLetter = organization.name.charAt(0).toUpperCase()
      
      return (
        <Avatar className="h-14 w-14">
          <AvatarImage 
            src={organization.logo as string | undefined} 
            alt={`${organization.name} logo`}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {firstLetter}
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  
  // Name Column (clean, no email)
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
        <div className="font-medium">
          {organization.name}
        </div>
      )
    },
  },

  // Email Column (separate)
  // {
  //   accessorKey: "contactEmail",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         className="h-auto p-0 hover:bg-transparent"
  //       >
  //         Email
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     )
  //   },
  //   cell: ({ row }) => {
  //     const email = row.getValue("contactEmail") as string
      
  //     if (!email) {
  //       return <span className="text-muted-foreground">No email</span>
  //     }
      
  //     return (
  //       <div className="flex items-center gap-2">
  //         <span className="text-sm">{email}</span>
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
  //           onClick={() => {
  //             navigator.clipboard.writeText(email)
  //             toast.success("Email copied to clipboard")
  //           }}
  //         >
  //           <Mail className="h-3 w-3" />
  //         </Button>
  //       </div>
  //     )
  //   },
  // },

    // Type Column
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string
      return (
        <Badge variant="default">
          {slug}
        </Badge>
      )
    },
  },


  // Type Column
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

  // Status Column
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const status = row.getValue("status") as string
  //     return (
  //       <Badge 
  //         variant={
  //           status === "active" 
  //             ? "default" 
  //             : status === "inactive" 
  //             ? "secondary" 
  //             : "destructive"
  //         }
  //       >
  //         {status.charAt(0).toUpperCase() + status.slice(1)}
  //       </Badge>
  //     )
  //   },
  // },

  // Created Date Column
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
      return new Date(createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    },
  },

  // Actions Column (simplified)
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
              onClick={() => {
                window.location.href = `/admin/organizations/${organization.id}`
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/admin/organizations/${organization.id}/edit`
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit organization
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/admin/organizations/${organization.id}/members`
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Open invitation modal/sheet
                toast.info("Send invitation feature coming soon")
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]