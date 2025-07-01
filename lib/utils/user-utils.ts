// lib/utils/user.utils.ts - User management utilities
import { UserRole, UserListItem, UserDetails, TechnicianProfile, InterpretingDoctorProfile } from "@/types/user.types";
import { clsx } from "clsx";

/**
 * Check if a role requires professional details
 */
export function requiresProfessionalDetails(role: UserRole): boolean {
  return role === "technician" || role === "interpreting_doctor";
}

/**
 * Check if a role is a professional role (technician or doctor)
 */
export function isProfessionalRole(role: UserRole): boolean {
  return role === "technician" || role === "interpreting_doctor";
}

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: UserRole): boolean {
  return ["system_admin", "five_am_admin", "client_admin"].includes(role);
}

/**
 * Check if a role is a 5AM Corp role
 */
export function isFiveAmRole(role: UserRole): boolean {
  return ["system_admin", "five_am_admin", "five_am_agent"].includes(role);
}

/**
 * Check if a role is a client organization role
 */
export function isClientRole(role: UserRole): boolean {
  return ["client_admin", "front_desk", "technician", "interpreting_doctor"].includes(role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    system_admin: "System Administrator",
    five_am_admin: "5AM Administrator", 
    five_am_agent: "5AM Agent",
    client_admin: "Client Administrator",
    front_desk: "Front Desk",
    technician: "Technician",
    interpreting_doctor: "Interpreting Doctor",
  };
  
  return roleNames[role] || role;
}

/**
 * Get role badge color classes
 */
export function getRoleBadgeClass(role: UserRole): string {
  const roleClasses: Record<UserRole, string> = {
    system_admin: "bg-red-100 text-red-800 border-red-200",
    five_am_admin: "bg-purple-100 text-purple-800 border-purple-200",
    five_am_agent: "bg-blue-100 text-blue-800 border-blue-200",
    client_admin: "bg-green-100 text-green-800 border-green-200",
    front_desk: "bg-yellow-100 text-yellow-800 border-yellow-200",
    technician: "bg-orange-100 text-orange-800 border-orange-200",
    interpreting_doctor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  
  return clsx(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
    roleClasses[role] || "bg-gray-100 text-gray-800 border-gray-200"
  );
}

/**
 * Get user status badge class
 */
export function getUserStatusBadgeClass(user: UserListItem | UserDetails): string {
  if (user.banned) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  
  if (!user.emailVerified) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  
  return "bg-green-100 text-green-800 border-green-200";
}

/**
 * Get user status display text
 */
export function getUserStatusText(user: UserListItem | UserDetails): string {
  if (user.banned) {
    const banExpires = user.banExpires ? new Date(user.banExpires) : null;
    if (banExpires && banExpires > new Date()) {
      return `Banned until ${banExpires.toLocaleDateString()}`;
    }
    return "Banned";
  }
  
  if (!user.emailVerified) {
    return "Email Not Verified";
  }
  
  return "Active";
}

/**
 * Get user's full name for display
 */
export function getUserDisplayName(
  user: UserListItem | UserDetails,
  includeEmail: boolean = false
): string {
  const name = user.name || "Unnamed User";
  
  if (includeEmail) {
    return `${name} (${user.email})`;
  }
  
  return name;
}

/**
 * Get professional profile display name
 */
export function getProfessionalDisplayName(
  profile: TechnicianProfile | InterpretingDoctorProfile
): string {
  const parts = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean);
  return parts.join(" ") || "Unnamed Professional";
}

/**
 * Format professional details for display
 */
export function formatProfessionalDetails(
  profile: TechnicianProfile | InterpretingDoctorProfile,
  type: "technician" | "interpreting_doctor"
): { 
  primaryInfo: string; 
  secondaryInfo: string; 
  additionalInfo: string[] 
} {
  if (type === "technician") {
    const tech = profile as TechnicianProfile;
    return {
      primaryInfo: `${tech.specialty} Technician`,
      secondaryInfo: `${tech.certificationLevel} • ${tech.employmentStatus}`,
      additionalInfo: [
        tech.licenseNumber ? `License: ${tech.licenseNumber}` : "",
        tech.phone ? `Phone: ${tech.phone}` : "",
      ].filter(Boolean),
    };
  } else {
    const doc = profile as InterpretingDoctorProfile;
    return {
      primaryInfo: `${doc.primarySpecialty} Specialist`,
      secondaryInfo: `${doc.readingStatus} • License: ${doc.licenseNumber}`,
      additionalInfo: [
        doc.secondarySpecialty ? `Secondary: ${doc.secondarySpecialty}` : "",
        doc.emergencyReads ? "Emergency Reads" : "",
        doc.weekendReads ? "Weekend Reads" : "",
        doc.nightReads ? "Night Reads" : "",
      ].filter(Boolean),
    };
  }
}

/**
 * Check if user can be edited by current user role
 */
export function canEditUser(
  targetUser: UserListItem | UserDetails,
  currentUserRole: UserRole,
  currentUserOrgId?: string,
  targetUserOrgId?: string
): boolean {
  // System admins can edit anyone
  if (currentUserRole === "system_admin") {
    return true;
  }
  
  // 5AM admins can edit non-system-admin users
  if (currentUserRole === "five_am_admin") {
    return targetUser.primaryRole !== "system_admin";
  }
  
  // Client admins can only edit users in their organization (except 5AM roles)
  if (currentUserRole === "client_admin") {
    const targetRole = targetUser.primaryRole as UserRole;
    return (
      currentUserOrgId === targetUserOrgId &&
      !isFiveAmRole(targetRole)
    );
  }
  
  return false;
}

/**
 * Check if user can be banned by current user role
 */
export function canBanUser(
  targetUser: UserListItem | UserDetails,
  currentUserRole: UserRole
): boolean {
  // Only system admins can ban users
  if (currentUserRole !== "system_admin") {
    return false;
  }
  
  // System admins cannot ban other system admins
  return targetUser.primaryRole !== "system_admin";
}

/**
 * Check if user can manage another user's memberships
 */
export function canManageMemberships(
  targetUser: UserListItem | UserDetails,
  currentUserRole: UserRole,
  currentUserOrgId?: string
): boolean {
  if (currentUserRole === "system_admin") {
    return true;
  }
  
  if (currentUserRole === "five_am_admin") {
    return targetUser.primaryRole !== "system_admin";
  }
  
  return false;
}

/**
 * Generate user initials for avatar
 */
export function getUserInitials(user: UserListItem | UserDetails): string {
  if (!user.name) {
    return user.email.charAt(0).toUpperCase();
  }
  
  const names = user.name.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format user creation date for display
 */
export function formatUserDate(date: Date | string, includeTime: boolean = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleString();
  }
  
  return dateObj.toLocaleDateString();
}

/**
 * Get available roles for user creation based on current user's role and org
 */
export function getAvailableRoles(
  currentUserRole: UserRole,
  targetOrganizationType?: "admin" | "client"
): Array<{ value: UserRole; label: string; disabled?: boolean }> {
  const allRoles: Array<{ value: UserRole; label: string; orgType: "admin" | "client" | "both" }> = [
    { value: "system_admin", label: "System Administrator", orgType: "admin" },
    { value: "five_am_admin", label: "5AM Administrator", orgType: "admin" },
    { value: "five_am_agent", label: "5AM Agent", orgType: "admin" },
    { value: "client_admin", label: "Client Administrator", orgType: "client" },
    { value: "front_desk", label: "Front Desk", orgType: "client" },
    { value: "technician", label: "Technician", orgType: "client" },
    { value: "interpreting_doctor", label: "Interpreting Doctor", orgType: "client" },
  ];
  
  return allRoles
    .filter(role => {
      // Filter by organization type
      if (targetOrganizationType && role.orgType !== "both" && role.orgType !== targetOrganizationType) {
        return false;
      }
      
      // Filter by current user permissions
      if (currentUserRole === "system_admin") {
        return true; // System admins can assign any role
      }
      
      if (currentUserRole === "five_am_admin") {
        return role.value !== "system_admin"; // Cannot create system admins
      }
      
      if (currentUserRole === "client_admin") {
        return role.orgType === "client" && !isFiveAmRole(role.value);
      }
      
      return false;
    })
    .map(role => ({
      value: role.value,
      label: role.label,
      disabled: false,
    }));
}

/**
 * Validate if role change is allowed
 */
export function canChangeRole(
  fromRole: UserRole,
  toRole: UserRole,
  currentUserRole: UserRole
): { allowed: boolean; reason?: string } {
  // System admins can change any role except to/from system_admin
  if (currentUserRole === "system_admin") {
    if (fromRole === "system_admin" || toRole === "system_admin") {
      return { 
        allowed: false, 
        reason: "System administrator role changes require special handling" 
      };
    }
    return { allowed: true };
  }
  
  // 5AM admins cannot change system admin roles
  if (currentUserRole === "five_am_admin") {
    if (fromRole === "system_admin" || toRole === "system_admin") {
      return { 
        allowed: false, 
        reason: "Cannot modify system administrator roles" 
      };
    }
    return { allowed: true };
  }
  
  // Client admins can only change roles within their organization
  if (currentUserRole === "client_admin") {
    if (isFiveAmRole(fromRole) || isFiveAmRole(toRole)) {
      return { 
        allowed: false, 
        reason: "Cannot modify 5AM Corp roles" 
      };
    }
    return { allowed: true };
  }
  
  return { allowed: false, reason: "Insufficient permissions" };
}