// lib/utils/organization-utils.ts
export function getOrganizationTypeColor(type: string) {
  switch (type) {
    case "admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    case "client":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
  }
}

export function getOrganizationStatusColor(isActive: boolean) {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
}

export function getOrganizationTypeLabel(type: string) {
  return type === "admin" ? "Admin Organization" : "Client Organization";
}

export function getOrganizationStatusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}