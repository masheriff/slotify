// components/admin/forms/member-filters-config.ts
import { FilterConfig, MEMBER_ROLES } from "@/types";

export const memberFilterConfig: FilterConfig[] = [
  {
    key: "role",
    label: "Role",
    type: "select",
    placeholder: "Filter by role",
    options: [
      // Remove the empty value option since the component handles "All" internally
      ...MEMBER_ROLES.map(role => ({
        value: role.value,
        label: role.label,
      })),
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Filter by status",
    options: [
      // Remove the empty value option since the component handles "All" internally
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    key: "joinedAfter",
    label: "Joined After",
    type: "date",
    placeholder: "Select date",
  },
];