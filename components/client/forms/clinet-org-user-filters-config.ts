// components/client/forms/client-org-user-filters-config.ts

import { FilterConfig } from "@/types";
import { CLIENT_ORG_ROLES } from "@/types/users.types";
import { getRoleLabel } from "@/utils/users.utils";

export const clientOrgUserFilterConfig: FilterConfig[] = [
  {
    label: "Role",
    key: "role",
    type: "select",
    placeholder: "All roles",
    options: [
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
    label: "Created After",
    key: "createdAfter",
    type: "date",
    placeholder: "Select date",
  },
];
