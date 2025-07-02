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
    system_admin: "border-purple-200 bg-purple-50 text-purple-700",
    five_am_admin: "border-blue-200 bg-blue-50 text-blue-700",
    five_am_agent: "border-cyan-200 bg-cyan-50 text-cyan-700",
    client_admin: "border-orange-200 bg-orange-50 text-orange-700",
    front_desk: "border-yellow-200 bg-yellow-50 text-yellow-700",
    technician: "border-green-200 bg-green-50 text-green-700",
    interpreting_doctor: "border-pink-200 bg-pink-50 text-pink-700",
  }
  return roleColors[role] || "border-gray-200 bg-gray-50 text-gray-700";
}

export function getMemberStatusColor(isActive: boolean): string {
  return isActive 
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700";
}

export function getMemberStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export function getMemberEmailVerifiedColor(isActive: boolean): string {
  return isActive 
    ? "border-green-200 bg-green-50 text-green-700"
    : "border-red-200 bg-red-50 text-red-700";
}

export function getMemberEmailVerifiedLabel(isActive: boolean): string {
  return isActive ? "Verified" : "Pending";
}