// components/admin/forms/user-filters-config.ts
import { FilterConfig } from "@/types";

export const userFilterConfig: FilterConfig[] = [
  {
    key: "role",
    label: "Role",
    type: "select",
    placeholder: "Filter by role",
    options: [
      { value: "", label: "All roles" },
      { value: "system_admin", label: "System Admin" },
      { value: "five_am_admin", label: "5AM Admin" },
      { value: "five_am_agent", label: "5AM Agent" },
      { value: "client_admin", label: "Client Admin" },
      { value: "front_desk", label: "Front Desk" },
      { value: "technician", label: "Technician" },
      { value: "interpreting_doctor", label: "Interpreting Doctor" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Filter by status",
    options: [
      { value: "", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
  {
    key: "organization",
    label: "Organization",
    type: "select",
    placeholder: "Filter by organization",
    options: [
      { value: "", label: "All organizations" },
      // Note: This would be populated dynamically with actual organizations
      // For now, providing placeholder structure
    ],
  },
  {
    key: "organizationType",
    label: "Organization Type",
    type: "select",
    placeholder: "Filter by organization type",
    options: [
      { value: "", label: "All types" },
      { value: "admin", label: "Admin" },
      { value: "client", label: "Client" },
    ],
  },
  {
    key: "createdAfter",
    label: "Created After",
    type: "date",
    placeholder: "Select date",
  },
  {
    key: "createdBefore",
    label: "Created Before",
    type: "date",
    placeholder: "Select date",
  },
  {
    key: "lastLoginAfter",
    label: "Last Login After",
    type: "date",
    placeholder: "Select date",
  },
  {
    key: "lastLoginBefore",
    label: "Last Login Before",
    type: "date",
    placeholder: "Select date",
  },
];