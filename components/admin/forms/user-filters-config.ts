// components/admin/forms/user-filters-config.ts - User List Filter Configuration
import { FilterConfig } from "@/types/component.types";

export const userFilterConfig: FilterConfig[] = [
  {
    label: "Search",
    key: "search",
    type: "text",
    placeholder: "Search by name or email...",
  },
  {
    label: "Role",
    key: "role",
    type: "select",
    placeholder: "Filter by role",
    options: [
      { value: "system_admin", label: "System Administrator" },
      { value: "five_am_admin", label: "5AM Administrator" },
      { value: "five_am_agent", label: "5AM Agent" },
      { value: "client_admin", label: "Client Administrator" },
      { value: "front_desk", label: "Front Desk" },
      { value: "technician", label: "Technician" },
      { value: "interpreting_doctor", label: "Interpreting Doctor" },
    ],
  },
  {
    label: "Status",
    key: "status",
    type: "select",
    placeholder: "Filter by status",
    options: [
      { value: "all", label: "All Users" },
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
  {
    label: "Organization",
    key: "organization",
    type: "text",
    placeholder: "Filter by organization name...",
  },
  {
    label: "Organization Type",
    key: "organizationType",
    type: "select",
    placeholder: "Filter by organization type",
    options: [
      { value: "admin", label: "Admin Organizations" },
      { value: "client", label: "Client Organizations" },
    ],
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date",
    placeholder: "Select start date",
  },
  {
    label: "Created Before",
    key: "createdBefore",
    type: "date",
    placeholder: "Select end date",
  },
  {
    label: "Last Login After",
    key: "lastLoginAfter",
    type: "date",
    placeholder: "Select start date",
  },
  {
    label: "Last Login Before",
    key: "lastLoginBefore",
    type: "date",
    placeholder: "Select end date",
  },
];