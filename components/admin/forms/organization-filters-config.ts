// components/admin/forms/organization-filters-config.ts
import { FilterConfig } from "@/lib/types/list-page"

export const organizationFilterConfig: FilterConfig[] = [
  {
    label: "Organization Type",
    key: "type",
    type: "select",
    options: [
      { value: "admin", label: "Admin Organization" },
      { value: "client", label: "Client Organization" },
    ],
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date",
  },
  {
    label: "Status",
    key: "status", 
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    label: "Contact Email",
    key: "contactEmail",
    type: "text",
  },
]