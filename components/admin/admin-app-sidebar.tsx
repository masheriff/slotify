"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Settings2,
  Command,
} from "lucide-react"

import { AdminNavMain } from "@/components/admin/admin-nav-main"
import { AdminNavUser } from "@/components/admin/admin-nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Admin navigation data
const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Organizations",
    url: "/5am-corp/admin/organizations",
    icon: Building,
    items: [
      { title: "All Organizations", url: "/5am-corp/admin/organizations" },
      { title: "Create Organization", url: "/5am-corp/admin/organizations/create" },
    ]
  },
  {
    title: "Users",
    url: "/5am-corp/admin/users", 
    icon: Users,
    items: [
      { title: "All Users", url: "/5am-corp/admin/users" },
      { title: "Create User", url: "/5am-corp/admin/users/create" },
    ]
  },
  {
    title: "Audit Logs",
    url: "/5am-corp/admin/audit-logs",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/5am-corp/admin/settings",
    icon: Settings2,
  },
]

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold">5 AM Corp</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={adminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}