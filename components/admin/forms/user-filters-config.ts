// components/admin/forms/user-filters-config.ts
import { FilterConfig } from "@/types/component.types";
import { ADMIN_ORG_ROLES, CLIENT_ORG_ROLES } from "@/types/users.types";
import { getRoleLabel } from "@/utils/users.utils";

export const userFilterConfig: FilterConfig[] = [
  {
    label: "Role",
    key: "role",
    type: "select",
    placeholder: "All roles",
    options: [
      ...Object.values(ADMIN_ORG_ROLES).map((role) => ({
        value: role,
        label: getRoleLabel(role as any),
      })),
      ...Object.values(CLIENT_ORG_ROLES).map((role) => ({
        value: role,
        label: getRoleLabel(role as any),
      })),
    ],
  },
  {
    label: "Status",
    key: "status",
    type: "select",
    placeholder: "All statuses",
    options: [
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
  {
    label: "Organization",
    key: "organization",
    type: "select",
    placeholder: "All organizations",
    options: [], // This would be populated dynamically with organizations
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date",
    placeholder: "Select date",
  },
];