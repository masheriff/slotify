// lib/auth-server.ts - Fixed version with proper super admin checking
import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { HEALTHCARE_ROLES } from "./permissions/healthcare-permissions-constants";
import { isSuperAdmin, isAdmin } from "./permissions/healthcare-access-control";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    console.log('🔍 Session retrieved:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      activeOrgId: session?.session?.activeOrganizationId,
    });
    
    return session;
  } catch (error) {
    console.error('❌ Failed to get session:', error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    console.log('🚫 No authenticated user, redirecting to login');
    redirect('/login');
  }
  console.log('✅ User authenticated:', session.user.email);
  return session;
}

/**
 * Require super admin access - FIXED to check user role directly
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  const user = session.user;
  
  console.log('🔍 Checking super admin access for user:', {
    userId: user.id,
    email: user.email,
    role: user.role,
    expectedRole: HEALTHCARE_ROLES.SYSTEM_ADMIN
  });
  
  // FIXED: Check user role directly instead of requiring membership
  // Super admins should be able to access organization management even without active membership
  if (!isSuperAdmin(user.role ?? "")) {
    console.error('❌ Super admin access denied:', {
      userRole: user.role,
      requiredRole: HEALTHCARE_ROLES.SYSTEM_ADMIN,
      availableRoles: Object.values(HEALTHCARE_ROLES)
    });
    throw new Error(`System admin access required. Current role: ${user.role}`);
  }
  
  console.log('✅ Super admin access granted');
  return { session, user };
}

/**
 * Get current user's active organization membership (optional)
 */
export async function getCurrentUserMembership() {
  try {
    const activeMember = await auth.api.getActiveMember({
      headers: await headers(),
    });
    
    return activeMember || null;
  } catch (error) {
    console.error("Failed to get current user membership:", error);
    return null;
  }
}

/**
 * Require admin access (System Admin, 5AM Admin, or Client Admin)
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const user = session.user;
  
  console.log('🔍 Checking admin access for user:', {
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // For organization-level admins, we need membership
  if (user.role === HEALTHCARE_ROLES.SYSTEM_ADMIN) {
    // System admins don't need membership
    console.log('✅ Admin access granted via system admin role');
    return { session, user, membership: null };
  }

  // For other admin roles, check membership
  const membership = await getCurrentUserMembership();
  if (!membership) {
    throw new Error("Organization membership required for admin access");
  }

  if (!isAdmin(membership.role)) {
    throw new Error("Admin access required");
  }

  console.log('✅ Admin access granted via membership role:', membership.role);
  return { session, user, membership };
}

/**
 * Require organization admin access (admin of specific organization)
 */
export async function requireOrgAdmin(organizationId: string) {
  const session = await requireAuth();
  const user = session.user;
  
  console.log('🔍 Checking org admin access:', {
    userId: user.id,
    organizationId: organizationId,
    userRole: user.role
  });
  
  // If user is system admin, they have access to everything
  if (isSuperAdmin(user.role ?? "")) {
    console.log('✅ Access granted via system admin role');
    return { session, user };
  }
  
  // For other roles, check organization-specific permissions
  console.log('🔍 Not system admin, checking org-specific permissions');
  
  try {
    // Use Better Auth's organization access check
    const hasAccess = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        organizationId: organizationId,
        permission: { organization: ['update'] },
      },
    });

    if (!hasAccess) {
      throw new Error("Organization admin access required");
    }

    console.log('✅ Organization admin access granted');
    return { session, user };
  } catch (error) {
    console.error('❌ Organization access check failed:', error);
    throw new Error("Organization admin access required");
  }
}

/**
 * Check if current user can perform action on resource
 */
export async function checkPermission(
  resource: string,
  action: string,
  organizationId?: string
): Promise<boolean> {
  try {
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permission: { [resource]: [action] },
        organizationId,
      },
    });

    return hasPermission.success;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

/**
 * Get current user's role in specific organization
 */
export async function getUserRoleInOrg(organizationId: string): Promise<string | null> {
  try {
    const user = await getServerSession();
    if (!user?.user) return null;

    // Use Better Auth to check user's role in the organization
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permission: { organization: ['update'] },
        organizationId,
      },
    });

    if (!hasPermission) return null;

    // Get the actual membership to extract role
    const activeMember = await getCurrentUserMembership();
    return activeMember?.role || null;
  } catch (error) {
    console.error("Failed to get user role in organization:", error);
    return null;
  }
}

/**
 * Get current user with role information
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession();
    return session?.user || null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}