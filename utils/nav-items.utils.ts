import { NavItems, UserRole } from "@/types";
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Settings2,
} from "lucide-react";

const system_admin_nav_items: NavItems[] = [
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
      {
        title: "Create Organization",
        url: "/5am-corp/admin/organizations/create",
      },
    ],
  },
  {
    title: "Users",
    url: "/5am-corp/admin/users",
    icon: Users,
    items: [
      { title: "All Users", url: "/5am-corp/admin/users" },
      { title: "Create User", url: "/5am-corp/admin/users/create" },
    ],
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
];
const five_am_admin_nav_items: NavItems[] = [];
const five_am_agent_nav_items: NavItems[] = [];
const client_admin_nav_items: NavItems[] = [];
const front_desk_nav_items: NavItems[] = [];
const technician_nav_items: NavItems[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    isActive: true,
  },
];
const interpreting_doctor_nav_items: NavItems[] = [];

export function getNavItemsAccordingToUserRole(userRole: UserRole): NavItems[] {
  const roleNavItems: Record<string, NavItems[]> = {
    system_admin: system_admin_nav_items,
    five_am_admin: five_am_admin_nav_items,
    five_am_agent: five_am_agent_nav_items,
    client_admin: client_admin_nav_items,
    front_desk: front_desk_nav_items,
    technician: technician_nav_items,
    interpreting_doctor: interpreting_doctor_nav_items,
  };
  return roleNavItems[userRole] || system_admin_nav_items;
}
