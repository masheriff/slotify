"use client";

import { AdminNavMain } from "@/components/admin/admin-nav-main";
import { AdminNavUser } from "@/components/admin/admin-nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Building, FileText, LayoutDashboard, Mail, Users } from "lucide-react";

export function AdminAppSidebar() {
  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Organizations",
      url: "/admin/organizations",
      icon: Building,
      items: [
        { title: "All Organizations", url: "/admin/organizations" },
        { title: "Create Organization", url: "/admin/organizations/create" },
      ]
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      items: [
        { title: "All Users", url: "/admin/users" },
        { title: "Invite User", url: "/admin/users/invite" },
      ]
    },
    {
      title: "Invitations",
      url: "/admin/invitations",
      icon: Mail,
    },
    {
      title: "Audit Logs",
      url: "/admin/audit",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Admin header - could include org switcher */}
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={adminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={{
                  name: "",
                  email: "",
                  avatar: ""
              }} />
      </SidebarFooter>
    </Sidebar>
  );
}
