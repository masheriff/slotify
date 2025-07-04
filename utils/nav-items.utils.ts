// utils/nav-items.utils.ts (Enhanced version with dynamic orgSlug support)
import { NavItems, UserRole } from "@/types";
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Settings2,
  Stethoscope,
  Calendar,
  MapPin,
  Activity,
  UserCheck,
  UserPlus,
  Briefcase,
  ClipboardList,
  Database,
  HeartHandshake,
  Building2,
  MonitorSpeaker,
  Zap,
} from "lucide-react";

// Helper function to build dynamic URLs for client organization roles
function buildDynamicNavItems(baseItems: NavItems[], orgSlug: string): NavItems[] {
  return baseItems.map(item => ({
    ...item,
    url: item.url.replace('{{orgSlug}}', orgSlug),
    items: item.items?.map(subItem => ({
      ...subItem,
      url: subItem.url.replace('{{orgSlug}}', orgSlug),
    })),
  }));
}

const static_client_nav_items: NavItems[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

//Admin Organization navigation items:

const system_admin_nav_items: NavItems[] = [
  {
    title: "Dashboard",
    url: "/5am-corp/admin/dashboard",
    icon: LayoutDashboard,
    isActive: false,
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
    title: "Staffs",
    url: "/5am-corp/admin/staffs",
    icon: UserCheck,
    items: [
      { title: "Technicians", url: "/5am-corp/admin/staffs/technicians" },
      { title: "Interpreting Doctors", url: "/5am-corp/admin/staffs/interpreting-doctors/create" },
    ],
  },
  {
    title: "Operations",
    url: "/5am-corp/admin/operations",
    icon: Activity,
    items: [
      { title: "Appointments", url: "/5am-corp/admin/operations/appointments" },
      { title: "Bookings", url: "/5am-corp/admin/operations/bookings" },
      { title: "Interpretations", url: "/5am-corp/admin/operations/interpretations" },
      { title: "Holter Devices Assignment", url: "/5am-corp/admin/operations/holter-devices-assignment" },
    ],
  },
  {
    title: "Masters",
    url: "/5am-corp/admin/masters",
    icon: Database,
    items: [
      { title: "Procedure Test Locations", url: "/5am-corp/admin/masters/procedure-test-locations" },
      { title: "Holter Devices Inventory", url: "/5am-corp/admin/masters/holter-devices-inventory" },
      { title: "Referring Doctors", url: "/5am-corp/admin/masters/referring-doctors" },
      { title: "Referring Entity", url: "/5am-corp/admin/masters/referring-entity" },
    ],
  },
  {
    title: "Audit Logs",
    url: "/5am-corp/admin/audit-logs",
    icon: FileText,
  },
];

// Fixed: Proper filter logic with return statement and strict comparison
const five_am_admin_nav_items: NavItems[] = system_admin_nav_items.filter(nav_item => nav_item.title !== 'Organizations');

const five_am_agent_nav_items: NavItems[] = [
  {
    title: "Dashboard",
    url: "/5am-corp/agent/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assigned Clients",
    url: "/5am-corp/agent/assigned-clients",
    icon: Building2,
  },
];

// Client organization navigation templates (with placeholder)
const client_admin_nav_template: NavItems[] = [
  {
    title: "Dashboard",
    url: "/{{orgSlug}}/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Staff",
    url: "/{{orgSlug}}/staff",
    icon: Users,
    items: [
      { title: "Users", url: "/{{orgSlug}}/staff/users" },
      { title: "Technicians", url: "/{{orgSlug}}/staff/technicians" },
      { title: "Interpreting Doctors", url: "/{{orgSlug}}/staff/interpreting-doctors" },
      { title: "Referring Doctors", url: "/{{orgSlug}}/staff/referring-doctors" },
    ],
  },
  {
    title: "Operations",
    url: "/{{orgSlug}}/operations",
    icon: Activity,
    items: [
      { title: "Patients", url: "/{{orgSlug}}/operations/patients" },
      { title: "Appointments", url: "/{{orgSlug}}/operations/appointments" },
      { title: "Bookings", url: "/{{orgSlug}}/operations/bookings" },
      { title: "Interpretations", url: "/{{orgSlug}}/operations/interpretations" },
      { title: "Holter Devices Assignment", url: "/{{orgSlug}}/operations/holter-devices-assignment" },
    ],
  },
  {
    title: "Masters",
    url: "/{{orgSlug}}/masters",
    icon: Database,
    items: [
      { title: "Procedure Test Locations", url: "/{{orgSlug}}/masters/procedure-test-locations" },
      { title: "Holter Devices Inventory", url: "/{{orgSlug}}/masters/holter-devices-inventory" },
      { title: "Referring Doctors", url: "/{{orgSlug}}/masters/referring-doctors" },
      { title: "Referring Entity", url: "/{{orgSlug}}/masters/referring-entity" },
    ],
  },
];

const front_desk_nav_template: NavItems[] = [
  {
    title: "Dashboard",
    url: "/{{orgSlug}}/front-desk/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    url: "/{{orgSlug}}/front-desk/appointments",
    icon: Calendar,
  },
  {
    title: "Bookings",
    url: "/{{orgSlug}}/front-desk/bookings",
    icon: ClipboardList,
  },
  {
    title: "Technicians",
    url: "/{{orgSlug}}/front-desk/technicians",
    icon: UserCheck,
  },
];

const technician_nav_template: NavItems[] = [
  {
    title: "Dashboard",
    url: "/{{orgSlug}}/technician/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Bookings",
    url: "/{{orgSlug}}/technician/my-bookings",
    icon: ClipboardList,
  },
  {
    title: "Holter Assignment",
    url: "/{{orgSlug}}/technician/holter-assignment",
    icon: MonitorSpeaker,
  },
];

const interpreting_doctor_nav_template: NavItems[] = [
  {
    title: "Dashboard",
    url: "/{{orgSlug}}/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Interpretation Queue",
    url: "/{{orgSlug}}/doctor/interpretation-queue",
    icon: ClipboardList,
  },
  {
    title: "My Interpretations",
    url: "/{{orgSlug}}/doctor/my-interpretations",
    icon: Stethoscope,
  },
];

export function getNavItemsAccordingToUserRole(
  userRole: UserRole,
  orgSlug?: string
): NavItems[] {
  const roleNavItems: Record<string, NavItems[]> = {
    // Admin organization roles (hardcoded paths)
    system_admin: system_admin_nav_items,
    five_am_admin: five_am_admin_nav_items,
    five_am_agent: five_am_agent_nav_items,
    
    // Client organization roles (dynamic paths or fallback)
    client_admin: orgSlug 
      ? buildDynamicNavItems(client_admin_nav_template, orgSlug)
      : static_client_nav_items,
    
    front_desk: orgSlug 
      ? buildDynamicNavItems(front_desk_nav_template, orgSlug)
      : static_client_nav_items,
    
    technician: orgSlug 
      ? buildDynamicNavItems(technician_nav_template, orgSlug)
      : static_client_nav_items,
    
    interpreting_doctor: orgSlug 
      ? buildDynamicNavItems(interpreting_doctor_nav_template, orgSlug)
      : static_client_nav_items,
  };
  
  return roleNavItems[userRole] || [];
}