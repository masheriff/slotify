// lib/utils/organization-utils.ts
export function getOrganizationTypeColor(type: string) {
  switch (type) {
    case "admin":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "client":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export function getOrganizationStatusColor(isActive: boolean) {
  return isActive
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700";
}

export function getOrganizationTypeLabel(type: 'admin' | 'client'): string {
  return type === 'admin' ? 'Admin Organization' : 'Client Organization';
}

export function getOrganizationStatusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}