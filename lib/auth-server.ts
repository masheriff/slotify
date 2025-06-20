import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export async function getServerSession() {
  return await auth.api.getSession({
    headers: await headers()
  });
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  const user = session.user;
  
  if (!user.role?.includes('super_admin')) {
    throw new Error('Super admin access required');
  }
  
  return { session, user };
}

export async function requireOrgAdmin(organizationId?: string) {
  const session = await requireAuth();
  
  // Use Better Auth's organization access check
  const hasAccess = await auth.api.hasPermission({
      body: {
          organizationId: organizationId ?? (session.session.activeOrganizationId === null ? undefined : session.session.activeOrganizationId),
          permission: { organization: ["update", "delete"] },
      },
      headers: await headers()
  });
  
  if (!hasAccess) {
    throw new Error('Organization admin access required');
  }
  
  return { session };
}

export async function startImpersonation(targetUserId: string) {
  const { user } = await requireSuperAdmin();
  
  return await auth.api.impersonateUser({
    body: { userId: targetUserId }
  });
}

export async function endImpersonation() {
  return await auth.api.stopImpersonating({});
}