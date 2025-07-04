// utils/users.utils.ts
import { 
  ADMIN_ORG_ROLES, 
  CLIENT_ORG_ROLES, 
  type UserRole, 
  type AdminOrgRole, 
  type ClientOrgRole,
  type UserPermissions,
  type ExtendedUser,
  type OrganizationWithType,
  UserListItem
} from '@/types/users.types';

/**
 * Get roles available for a specific organization type
 */
export function getRolesByOrganizationType(orgType: 'admin' | 'client'): UserRole[] {
  if (orgType === 'admin') {
    return Object.values(ADMIN_ORG_ROLES) as AdminOrgRole[];
  } else {
    return Object.values(CLIENT_ORG_ROLES) as ClientOrgRole[];
  }
}

/**
 * Get user-friendly role labels
 */
export function getRoleLabel(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    [ADMIN_ORG_ROLES.SYSTEM_ADMIN]: 'System Administrator',
    [ADMIN_ORG_ROLES.FIVE_AM_ADMIN]: '5AM Admin',
    [ADMIN_ORG_ROLES.FIVE_AM_AGENT]: '5AM Agent',
    [CLIENT_ORG_ROLES.CLIENT_ADMIN]: 'Client Admin',
    [CLIENT_ORG_ROLES.FRONT_DESK]: 'Front Desk',
    [CLIENT_ORG_ROLES.TECHNICIAN]: 'Technician',
    [CLIENT_ORG_ROLES.INTERPRETING_DOCTOR]: 'Interpreting Doctor',
  };

  return roleLabels[role] || role;
}


/**
 * Check if a role is an admin organization role
 */
export function isAdminOrgRole(role: string): role is AdminOrgRole {
  return Object.values(ADMIN_ORG_ROLES).includes(role as AdminOrgRole);
}

/**
 * Check if a role is a client organization role
 */
export function isClientOrgRole(role: string): role is ClientOrgRole {
  return Object.values(CLIENT_ORG_ROLES).includes(role as ClientOrgRole);
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleHierarchy(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    [ADMIN_ORG_ROLES.SYSTEM_ADMIN]: 100,
    [ADMIN_ORG_ROLES.FIVE_AM_ADMIN]: 90,
    [ADMIN_ORG_ROLES.FIVE_AM_AGENT]: 80,
    [CLIENT_ORG_ROLES.CLIENT_ADMIN]: 70,
    [CLIENT_ORG_ROLES.FRONT_DESK]: 60,
    [CLIENT_ORG_ROLES.TECHNICIAN]: 50,
    [CLIENT_ORG_ROLES.INTERPRETING_DOCTOR]: 50,
  };

  return hierarchy[role] || 0;
}

/**
 * Check if user can view user details - NEW FUNCTION
 */
export function canViewUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  // Super admins can view anyone
  if (currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN) {
    return true;
  }

  // 5AM Admins can view anyone except system admins
  if (currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN) {
    return true;
  }

  // ✅ NEW: Client admins can view users within their organization
  if (currentUserRole === CLIENT_ORG_ROLES.CLIENT_ADMIN) {
    const clientOrgRoles = Object.values(CLIENT_ORG_ROLES);
    return clientOrgRoles.includes(targetUserRole as ClientOrgRole);
  }

  return false;
}

/**
 * Check if user can create a specific role
 */
export function canCreateRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  const currentHierarchy = getRoleHierarchy(currentUserRole);
  const targetHierarchy = getRoleHierarchy(targetRole);

  // Super admins can create any role
  if (currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN) {
    return true;
  }

  // Admins can create admins and agents, but not other super admins
  if (currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN) {
    return targetRole !== ADMIN_ORG_ROLES.SYSTEM_ADMIN;
  }

  // Other roles cannot create users
  return false;
}


/**
 * Check if user can edit another user - UPDATED WITH CLIENT ADMIN SUPPORT
 */
export function canEditUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  // Super admins can edit anyone
  if (currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN) {
    return true;
  }

  // 5AM Admins can edit users with lower hierarchy, but not other super admins
  if (currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN) {
    return targetUserRole !== ADMIN_ORG_ROLES.SYSTEM_ADMIN;
  }

  // ✅ NEW: Client admins can edit users within their organization
  if (currentUserRole === CLIENT_ORG_ROLES.CLIENT_ADMIN) {
    // Client admins can edit other client org users, but not admin org users
    const clientOrgRoles = Object.values(CLIENT_ORG_ROLES);
    return clientOrgRoles.includes(targetUserRole as ClientOrgRole);
  }

  return false;
}

/**
 * Check if user can ban another user - UPDATED WITH CLIENT ADMIN SUPPORT
 */
export function canBanUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  // Super admins can ban anyone (except other super admins)
  if (currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN) {
    return targetUserRole !== ADMIN_ORG_ROLES.SYSTEM_ADMIN;
  }

  // 5AM Admins can ban users with lower hierarchy, but not system admins
  if (currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN) {
    return targetUserRole !== ADMIN_ORG_ROLES.SYSTEM_ADMIN;
  }

  // ✅ NEW: Client admins can ban users within their organization (except other client admins)
  if (currentUserRole === CLIENT_ORG_ROLES.CLIENT_ADMIN) {
    const lowerClientRoles: ClientOrgRole[] = [
      CLIENT_ORG_ROLES.FRONT_DESK,
      CLIENT_ORG_ROLES.TECHNICIAN,
      CLIENT_ORG_ROLES.INTERPRETING_DOCTOR,
    ];
    return lowerClientRoles.includes(targetUserRole as ClientOrgRole);
  }

  return false;
}

/**
 * Check if user can impersonate another user
 */
export function canImpersonateUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  // Only super admins can impersonate, and not other super admins
  return currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN && 
         targetUserRole !== ADMIN_ORG_ROLES.SYSTEM_ADMIN;
}

/**
 * Get user permissions based on their role
 */
export function getUserPermissions(currentUserRole: UserRole): UserPermissions {
  return {
    canCreate: currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN || 
               currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN,
    canEdit: currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN || 
             currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN,
    canBan: currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN || 
            currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN,
    canImpersonate: currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN,
    canViewAll: currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN || 
                currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN,
  };
}

/**
 * Format ban expiration for display
 */
export function formatBanExpiration(banExpires?: Date | null): string {
  if (!banExpires) return 'Permanent';
  
  const date = new Date(banExpires);
  const now = new Date();
  
  if (date < now) return 'Expired';
  
  return date.toLocaleDateString();
}

/**
 * Validate role assignment for organization
 */
export function validateRoleAssignment(
  role: UserRole, 
  organization: OrganizationWithType
): boolean {
  const orgType = organization.metadata.type;
  
  if (orgType === 'admin') {
    return isAdminOrgRole(role);
  } else {
    return isClientOrgRole(role);
  }
}

/**
 * Get organizations that current user can assign others to (permission check only)
 */
export function canAssignToOrganization(
  currentUserRole: UserRole,
  organizationType: 'admin' | 'client'
): boolean {
  // Super admins can assign to any organization
  if (currentUserRole === ADMIN_ORG_ROLES.SYSTEM_ADMIN) {
    return true;
  }

  // Admins can assign to any organization
  if (currentUserRole === ADMIN_ORG_ROLES.FIVE_AM_ADMIN) {
    return true;
  }

  // Other roles cannot create users
  return false;
}

/**
 * Generate magic link token (placeholder - implement according to your auth system)
 */
export function generateMagicLinkToken(): string {
  return crypto.randomUUID();
}

/**
 * Format user status for display
 */
export function getUserStatus(user: ExtendedUser | UserListItem): {
  status: 'active' | 'banned';
  label: string;
  className: string;
} {
  if (user.banned) {
    const isExpired = user.banExpires && new Date(user.banExpires) < new Date();
    
    if (isExpired) {
      return {
        status: 'active',
        label: 'Active (Ban Expired)',
        className: 'border-yellow-200 bg-yellow-50 text-yellow-700800',
      };
    }
    
    return {
      status: 'banned',
      label: user.banExpires ? 'Temporarily Banned' : 'Banned',
      className: 'border-red-200 bg-red-50 text-red-700',
    };
  }

  return {
    status: 'active',
    label: 'Active',
    className: 'border-green-200 bg-green-50 text-green-700',
  };
}

/**
 * Format user display name
 */
export function formatUserDisplayName(user: ExtendedUser | UserListItem): string {
  return user.name || user.email || 'Unknown User';
}