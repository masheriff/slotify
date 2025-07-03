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
import Image from "next/image";
import { getNavItemsAccordingToUserRole } from "@/utils/nav-items.utils";
import { UserRole } from "@/types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: organization } = useActiveOrganization();
  const { data: sessionData } = useSession();
  const { user } = sessionData ?? {};
  const { role } = user ?? {};
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <div className="flex items-center w-full">
          {organization?.logo ? (
            <Image
              src={organization?.logo}
              alt={`${organization?.name} logo`}
              width={0}
              height={0}
              quality={100}
              priority
              unoptimized
              className="h-14 w-auto"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {organization?.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavItemsAccordingToUserRole(role as UserRole)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
