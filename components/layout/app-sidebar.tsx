// components/layout/app-sidebar.tsx
"use client";

import * as React from "react";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getNavItemsAccordingToUserRole } from "@/utils/nav-items.utils";
import { UserRole } from "@/types";
import { OrganizationLogo } from "./organization-logo";
import { useAuthStore } from "@/stores/auth-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get data from global store - no API calls!
  const { user, organization, isLoading, initializeAuth } = useAuthStore();
  
  // Refresh data if needed (runs only once per component mount)
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const role = user?.role as UserRole;

  // Memoize navigation items
  const navItems = React.useMemo(() => 
    getNavItemsAccordingToUserRole(role), 
    [role]
  );

  // Show loading skeleton if no data
  if (isLoading || !user || !organization) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="flex items-center gap-2 p-4">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="h-10 bg-muted rounded animate-pulse" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <OrganizationLogo 
          logo={organization.logo ?? undefined} 
          name={organization.name} 
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}