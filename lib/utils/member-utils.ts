// Helper functions for member display
export function getMemberRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    system_admin: "System Admin",
    five_am_admin: "5AM Admin", 
    five_am_agent: "5AM Agent",
    client_admin: "Client Admin",
    front_desk: "Front Desk",
    technician: "Technician",
    interpreting_doctor: "Interpreting Doctor",
  };
  return roleLabels[role] || role;
}

export function getMemberRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    system_admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    five_am_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    five_am_agent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    client_admin: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    front_desk: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    technician: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    interpreting_doctor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return roleColors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}

export function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function getMemberStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export function getMemberEmailVerifiedColor(isActive: boolean): string {
  return isActive 
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

export function getMemberEmailVerifiedLabel(isActive: boolean): string {
  return isActive ? "Verified" : "Pending";
}