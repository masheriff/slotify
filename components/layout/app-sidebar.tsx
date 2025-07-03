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
import { Organization, User, UserRole } from "@/types";
import { OrganizationLogo } from "./organization-logo";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
  organization: Organization;
  userRole: UserRole;
}

export function AppSidebar({ 
  user, 
  organization, 
  userRole, 
  ...props 
}: AppSidebarProps) {
  const navItems = getNavItemsAccordingToUserRole(userRole);

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
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}