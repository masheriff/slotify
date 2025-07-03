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
  const { user, organization } = useAuthStore();
  console.log(user);


  const role = user?.role as UserRole;

  // Memoize navigation items
  const navItems = React.useMemo(() => 
    getNavItemsAccordingToUserRole(role), 
    [role]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <OrganizationLogo 
          logo={organization?.logo ?? undefined} 
          name={organization?.name ?? ""} 
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}