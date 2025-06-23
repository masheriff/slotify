// lib/auth-server.ts - Enhanced with better role checking and debugging
import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { HEALTHCARE_ROLES } from "./permissions/healthcare-permissions-constants";

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

export async function requireSuperAdmin() {
  const session = await requireAuth();
  const user = session.user;
  
  console.log('🔍 Checking super admin access for user:', {
    userId: user.id,
    email: user.email,
    role: user.role,
    expectedRole: HEALTHCARE_ROLES.SYSTEM_ADMIN
  });
  
  // Check multiple possible role formats that Better Auth might use
  const hasSystemAdminRole = 
    user.role === HEALTHCARE_ROLES.SYSTEM_ADMIN ||
    user.role?.includes(HEALTHCARE_ROLES.SYSTEM_ADMIN) ||
    user.role?.includes('system_admin') ||
    user.role?.includes('SYSTEM_ADMIN');
  
  if (!hasSystemAdminRole) {
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

export async function requireOrgAdmin(organizationId?: string) {
  const session = await requireAuth();
  
  console.log('🔍 Checking org admin access:', {
    userId: session.user.id,
    organizationId: organizationId || session.session.activeOrganizationId,
    userRole: session.user.role
  });
  
  // If user is system admin, they have access to everything
  try {
    await requireSuperAdmin();
    console.log('✅ Access granted via system admin role');
    return { session };
  } catch {
    // Not a system admin, check organization-specific permissions
    console.log('🔍 Not system admin, checking org-specific permissions');
  }
  
  try {
    // Use Better Auth's organization access check
    const hasAccess = await auth.api.hasPermission({
        body: {
            organizationId: organizationId ?? (session.session.activeOrganizationId === null ? undefined : session.session.activeOrganizationId),
            permission: { organization: ["update", "delete"] },
        },
        headers: await headers()
    });
    
    console.log('🔍 Organization permission check result:', {
      hasAccess,
      organizationId: organizationId ?? session.session.activeOrganizationId
    });
    
    if (!hasAccess) {
      throw new Error('Organization admin access required');
    }
    
    console.log('✅ Organization admin access granted');
    return { session };
  } catch (error) {
    console.error('❌ Organization admin access denied:', error);
    throw new Error(`Organization admin access required: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function startImpersonation(targetUserId: string) {
  const { user } = await requireSuperAdmin();
  
  console.log('🎭 Starting impersonation:', {
    adminUserId: user.id,
    targetUserId
  });
  
  return await auth.api.impersonateUser({
    body: { userId: targetUserId }
  });
}

export async function endImpersonation() {
  console.log('🎭 Ending impersonation');
  return await auth.api.stopImpersonating({});
}

// Debug function to check current user's permissions and roles
export async function debugUserPermissions() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return {
        authenticated: false,
        error: 'No session found'
      };
    }
    
    const user = session.user;
    const sessionData = session.session;
    
    // Check if user is system admin
    let isSystemAdmin = false;
    try {
      await requireSuperAdmin();
      isSystemAdmin = true;
    } catch {
      isSystemAdmin = false;
    }
    
    // Get user's organization memberships
    let organizations: any[] = [];
    try {
      organizations = await auth.api.listOrganizations({
        headers: await headers(),
      });
    } catch (error) {
      console.warn('Could not fetch organizations:', error);
    }
    
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      session: {
        id: sessionData.id,
        userId: sessionData.userId,
        activeOrganizationId: sessionData.activeOrganizationId,
        expiresAt: sessionData.expiresAt,
        token: sessionData.token ? '[REDACTED]' : null,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent
      },
      permissions: {
        isSystemAdmin,
        organizationCount: organizations.length,
        hasActiveOrganization: !!sessionData.activeOrganizationId,
        availableRoles: Object.values(HEALTHCARE_ROLES)
      },
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        metadata: org.metadata
      }))
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
}

// Alternative requireSuperAdmin that's more forgiving for debugging
export async function requireSuperAdminOrDebug() {
  try {
    return await requireSuperAdmin();
  } catch (error) {
    console.error('❌ Super admin check failed, providing debug info:', error);
    
    const debugInfo = await debugUserPermissions();
    console.log('🔍 Debug info:', JSON.stringify(debugInfo, null, 2));
    
    throw new Error(`Super admin access required. Debug info logged to console. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}