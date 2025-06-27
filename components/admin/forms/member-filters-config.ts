// components/admin/forms/member-filters-config.ts
import { FilterConfig, MEMBER_ROLES } from "@/types";

export const memberFilterConfig: FilterConfig[] = [
  {
    key: "role",
    label: "Role",
    type: "select",
    placeholder: "Filter by role",
    options: [
      { value: "", label: "All roles" },
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
      { value: "", label: "All statuses" },
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