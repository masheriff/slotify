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
import { useActiveOrganization, useSession } from "@/lib/auth-client";
import { getNavItemsAccordingToUserRole } from "@/utils/nav-items.utils";
import { UserRole } from "@/types";
import { OrganizationLogo } from "./organization-logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: organization } = useActiveOrganization();
  const { data: sessionData } = useSession();
  const { user } = sessionData ?? {};
  const { role } = user ?? {};
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <OrganizationLogo logo={organization?.logo ?? undefined} name={organization?.name} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavItemsAccordingToUserRole(role as UserRole)} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser user={user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
